import io
from datetime import timedelta
from typing import Optional
from urllib.parse import urlparse, urlunparse
from minio import Minio
from minio.error import S3Error
from app.config import settings


class MinIOClient:
    _instance: Optional['MinIOClient'] = None
    
    def __new__(cls) -> 'MinIOClient':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self) -> None:
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket()
    
    def _ensure_bucket(self) -> None:
        if not self.client.bucket_exists(self.bucket_name):
            self.client.make_bucket(self.bucket_name)
    
    def upload_chunk(
        self,
        object_name: str,
        data: bytes,
        content_type: str = "application/octet-stream"
    ) -> None:
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
        expires_delta = timedelta(seconds=expires_seconds)
        
        url = self.client.presigned_get_object(
            bucket_name=self.bucket_name,
            object_name=object_name,
            expires=expires_delta,
        )
        
        # Parse the internal MinIO URL
        parsed = urlparse(url)
        
        # Build public URL through nginx
        # Original: http://backup-minio:9000/backup-files/...
        # Target:   http://localhost/minio/backup-files/...
        public_url = urlunparse((
            "http",                           # scheme
            "localhost",                      # netloc
            f"/minio{parsed.path}",          # path (add /minio prefix)
            parsed.params,                   # params
            parsed.query,                    # query (preserves signature)
            parsed.fragment                  # fragment
        ))
        
        return public_url
    
    def delete_object(self, object_name: str) -> None:
        self.client.remove_object(
            bucket_name=self.bucket_name,
            object_name=object_name,
        )
    
    def object_exists(self, object_name: str) -> bool:
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False


minio_client = MinIOClient()
