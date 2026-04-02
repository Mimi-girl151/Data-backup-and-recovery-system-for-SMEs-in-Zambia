from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    """Response after uploading a chunk."""
    success: bool
    file_id: Optional[str] = None
    message: str
    chunk_uploaded: int
    total_chunks: int


class FileListResponse(BaseModel):
    """Response for file list item."""
    id: str
    original_filename: str
    file_size: int
    mime_type: Optional[str]
    created_at: datetime


class FileDownloadResponse(BaseModel):
    """Response for file download request."""
    file_id: str
    original_filename: str
    file_size: int
    mime_type: Optional[str]
    iv: str
    checksum: Optional[str]
    chunk_count: int
    presigned_urls: List[str]