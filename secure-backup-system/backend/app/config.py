from typing import Optional, List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
import json


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://backupuser:backuppass123@postgres:5432/backupdb",
        description="PostgreSQL async database URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=20, description="Database connection pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=10, description="Max overflow connections")
    
    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="change-this-secret-in-production-use-strong-random-string",
        description="Secret key for JWT signing"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, description="Token expiry in minutes (24 hours)")
    
    # MinIO Storage
    MINIO_ENDPOINT: str = Field(default="minio:9000", description="MinIO server endpoint")
    MINIO_ACCESS_KEY: str = Field(default="minioadmin", description="MinIO access key")
    MINIO_SECRET_KEY: str = Field(default="minioadmin123", description="MinIO secret key")
    MINIO_BUCKET: str = Field(default="backup-files", description="Default bucket name")
    MINIO_SECURE: bool = Field(default=False, description="Use HTTPS for MinIO")
    
    # CORS - Accept both string and list formats
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:80"],
        description="Allowed CORS origins (can be comma-separated string or list)"
    )
    
    # Application
    ENVIRONMENT: str = Field(default="development", description="Runtime environment")
    DEBUG: bool = Field(default=True, description="Debug mode")
    API_VERSION: str = Field(default="v1", description="API version")
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            # Try to parse as JSON first
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # If not JSON, split by comma
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )
    
    @property
    def async_database_url(self) -> str:
        """Return the async database URL for SQLAlchemy."""
        return self.DATABASE_URL
    
    @property
    def sync_database_url(self) -> str:
        """Convert async URL to sync URL for Alembic."""
        return self.DATABASE_URL.replace("+asyncpg", "")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Return CORS origins as list."""
        if isinstance(self.CORS_ORIGINS, str):
            return [self.CORS_ORIGINS]
        return self.CORS_ORIGINS


# Global settings instance
settings = Settings()