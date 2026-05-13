import os
from typing import Optional, List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
import json


def read_secret_or_env(secret_file_path: str, env_var_name: str, default: Optional[str] = None) -> str:
    """
    Read a secret from a Docker secret file, or fall back to environment variable.
    
    Priority:
    1. Docker secret file (if exists at /run/secrets/{secret_file_path})
    2. Environment variable
    3. Default value
    
    Args:
        secret_file_path: Path to secret file (e.g., 'db_user' -> /run/secrets/db_user)
        env_var_name: Name of environment variable to fall back to
        default: Default value if neither secret nor env var exists
    
    Returns:
        Secret value as string
    """
    # Try Docker secret first
    secret_full_path = f"/run/secrets/{secret_file_path}"
    if os.path.exists(secret_full_path):
        with open(secret_full_path, 'r') as f:
            return f.read().strip()
    
    # Fall back to environment variable
    env_value = os.getenv(env_var_name)
    if env_value is not None:
        return env_value
    
    # Finally, use default
    if default is not None:
        return default
    
    raise ValueError(f"Secret not found: {secret_file_path} (no secret file, no env var {env_var_name})")


class Settings(BaseSettings):
    """Application configuration loaded from environment variables or Docker secrets."""
    
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
    MINIO_ENDPOINT: str = Field(default="minio:9000", description="MinIO server endpoint (internal Docker)")
    MINIO_EXTERNAL_ENDPOINT: str = Field(
        default="localhost:9000", 
        description="MinIO external endpoint for browser presigned URLs"
    )
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
            try:
                return json.loads(v)
            except json.JSONDecodeError:
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
    
    @property
    def db_user(self) -> str:
        """Get database user from secret or env."""
        return read_secret_or_env("db_user", "DB_USER", "backupuser")
    
    @property
    def db_password(self) -> str:
        """Get database password from secret or env."""
        return read_secret_or_env("db_password", "DB_PASSWORD", "backuppass123")
    
    @property
    def db_name(self) -> str:
        """Get database name from secret or env."""
        return read_secret_or_env("db_name", "DB_NAME", "backupdb")
    
    @property
    def jwt_secret(self) -> str:
        """Get JWT secret from secret or env."""
        return read_secret_or_env("jwt_secret", "JWT_SECRET_KEY", "change-this-secret-in-production")
    
    @property
    def minio_access_key(self) -> str:
        """Get MinIO access key from secret or env."""
        return read_secret_or_env("minio_user", "MINIO_ACCESS_KEY", "minioadmin")
    
    @property
    def minio_secret_key(self) -> str:
        """Get MinIO secret key from secret or env."""
        return read_secret_or_env("minio_password", "MINIO_SECRET_KEY", "minioadmin123")
    
    @property
    def minio_external_endpoint(self) -> str:
        """Get MinIO external endpoint for browser presigned URLs."""
        return self.MINIO_EXTERNAL_ENDPOINT
    
    @property
    def resolved_database_url(self) -> str:
        """Build database URL from secrets (preferred) or env vars."""
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@postgres:5432/{self.db_name}"


# Global settings instance
settings = Settings()