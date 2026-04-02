import io
from datetime import timedelta
from typing import Optional
from minio import Minio
from minio.error import S3Error
from app.config import settings


class MinIOClient:
    """Singleton client for MinIO object storage."""
    
    _instance: Optional['MinIOClient'] = None
    
    def __new__(cls) -> 'MinIOClient':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self) -> None:
        """Initialize the MinIO client."""
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket()
    
    def _ensure_bucket(self) -> None:
        """Create bucket if it doesn't exist."""
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)
    
    def upload_chunk(
        self,
        object_name: str,
        data: bytes,
        content_type: str = "application/octet-stream"
    ) -> None:
        """
        Upload a file chunk to MinIO.
        
        Args:
            object_name: Full path for the object (e.g., user_id/file_id/chunk_0)
            data: Binary data to upload
            content_type: MIME type of the data
        """
        data_stream = io.BytesIO(data)
        self.client.put_object(
            bucket_name=self.bucket_name,
            object_name=object_name,
            data=data_stream,
            length=len(data),
            content_type=content_type,
        )
    
    def get_presigned_download_url(
        self,
        object_name: str,
        expires_seconds: int = 3600
    ) -> str:
        """
        Generate a presigned URL for downloading an object.
        
        Args:
            object_name: Full path of the object
            expires_seconds: Expiry time in seconds (default: 1 hour)
            
        Returns:
            Presigned URL string
        """
        # Convert seconds to timedelta
        expires_delta = timedelta(seconds=expires_seconds)
        
        return self.client.presigned_get_object(
            bucket_name=self.bucket_name,
            object_name=object_name,
            expires=expires_delta,
        )
    
    def delete_object(self, object_name: str) -> None:
        """
        Delete an object from MinIO.
        
        Args:
            object_name: Full path of the object to delete
        """
        self.client.remove_object(
            bucket_name=self.bucket_name,
            object_name=object_name,
        )
    
    def object_exists(self, object_name: str) -> bool:
        """
        Check if an object exists in MinIO.
        
        Args:
            object_name: Full path of the object
            
        Returns:
            True if object exists, False otherwise
        """
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False


# Singleton instance
minio_client = MinIOClient()