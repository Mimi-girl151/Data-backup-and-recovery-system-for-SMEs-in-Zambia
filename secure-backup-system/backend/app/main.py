from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime
from app.config import settings
from app.api import auth, files
from app.db.session import get_db
from app.core.minio_client import minio_client

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="Secure Backup System API",
    description="Secure Data Backup and Recovery System for SMEs",
    version=settings.API_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add rate limit exception handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.state.limiter = limiter

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(files.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Light health check endpoint - returns service status.
    Used for Docker health checks and basic monitoring.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.API_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health/deep", tags=["Health"])
async def deep_health_check(db: AsyncSession = Depends(get_db)):
    """
    Deep health check endpoint - verifies ALL service dependencies.
    
    Checks:
    1. PostgreSQL database connectivity (SELECT 1)
    2. MinIO storage connectivity (write/read/delete test)
    
    Returns:
        - 200 OK if all services are healthy
        - 503 Service Unavailable if any service is degraded
    
    Used for:
        - Load balancer health checks
        - Kubernetes readiness/liveness probes
        - Automated monitoring and alerting
    """
    health = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {},
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT
    }
    overall_status = "healthy"
    
    # ============================================
    # 1. Check PostgreSQL Connectivity
    # ============================================
    try:
        await db.execute(text("SELECT 1"))
        health["services"]["postgresql"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        health["services"]["postgresql"] = {
            "status": "unhealthy",
            "message": f"Connection failed: {str(e)}"
        }
        overall_status = "degraded"
    
    # ============================================
    # 2. Check MinIO Connectivity (Write/Read/Delete Test)
    # ============================================
    try:
        # Generate unique test object name
        test_object = f"healthcheck/probe_{datetime.utcnow().timestamp()}.txt"
        test_data = b"vaultguard-healthcheck-probe"
        
        # Write test object
        minio_client.upload_chunk(test_object, test_data)
        health["services"]["minio_write"] = {
            "status": "healthy",
            "message": "Write operation successful"
        }
        
        # Read test object (generate presigned URL)
        presigned_url = minio_client.get_presigned_download_url(test_object, expires_seconds=60)
        health["services"]["minio_read"] = {
            "status": "healthy",
            "message": "Read operation successful"
        }
        
        # Delete test object (cleanup)
        minio_client.delete_object(test_object)
        health["services"]["minio_delete"] = {
            "status": "healthy",
            "message": "Delete operation successful"
        }
        
        health["services"]["minio"] = {
            "status": "healthy",
            "message": "Full read/write/delete cycle successful",
            "bucket": minio_client.bucket_name
        }
        
    except Exception as e:
        health["services"]["minio"] = {
            "status": "unhealthy",
            "message": f"MinIO operation failed: {str(e)}"
        }
        overall_status = "degraded"
    
    # ============================================
    # 3. Set Overall Status
    # ============================================
    if overall_status == "degraded":
        health["status"] = "degraded"
        raise HTTPException(status_code=503, detail=health)
    
    return health


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Secure Backup System API",
        "version": settings.API_VERSION,
        "docs": "/docs" if settings.DEBUG else None
    }