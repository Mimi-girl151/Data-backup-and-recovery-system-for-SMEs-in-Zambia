import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.file_metadata import FileMetadata
from app.models.audit_log import AuditLog
from app.schemas.file import FileUploadResponse, FileListResponse, FileDownloadResponse
from app.api.deps import get_current_active_user
from app.core.minio_client import minio_client

router = APIRouter(prefix="/files", tags=["Files"])


@router.post("/upload", response_model=FileUploadResponse)
async def upload_chunk(
    file: UploadFile = File(...),
    original_name: str = Form(...),
    iv: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    checksum: str = Form(...),
    file_size: int = Form(...),
    mime_type: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> FileUploadResponse:
    """
    Upload an encrypted file chunk to MinIO.
    For the last chunk, save metadata to database.
    """
    # Generate file ID for this upload
    file_id = str(uuid.uuid4())
    object_name = f"{current_user.id}/{file_id}/chunk_{chunk_index}.enc"
    
    # Read file content
    content = await file.read()
    
    # Upload to MinIO
    try:
        minio_client.upload_chunk(
            object_name=object_name,
            data=content,
            content_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload to storage: {str(e)}"
        )
    
    # If this is the last chunk, save metadata
    if chunk_index == total_chunks - 1:
        # Build encrypted path
        encrypted_path = f"{current_user.id}/{file_id}"
        
        # Save to database
        file_metadata = FileMetadata(
            id=file_id,
            user_id=current_user.id,
            original_filename=original_name,
            file_size=file_size,
            mime_type=mime_type,
            iv=iv,
            checksum=checksum,
            chunk_count=total_chunks,
            encrypted_path=encrypted_path,
            status="active",
        )
        
        db.add(file_metadata)
        
        # Log the upload
        audit_log = AuditLog(
            user_id=current_user.id,
            action="UPLOAD",
            resource="file",
            resource_id=file_id,
            details={
                "filename": original_name,
                "size": file_size,
                "chunks": total_chunks,
            }
        )
        db.add(audit_log)
        
        await db.commit()
        
        return FileUploadResponse(
            success=True,
            file_id=file_id,
            message="File uploaded successfully",
            chunk_uploaded=chunk_index + 1,
            total_chunks=total_chunks,
        )
    
    return FileUploadResponse(
        success=True,
        file_id=file_id,
        message=f"Chunk {chunk_index + 1} uploaded",
        chunk_uploaded=chunk_index + 1,
        total_chunks=total_chunks,
    )


@router.get("/list", response_model=List[FileListResponse])
async def list_files(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
) -> List[FileListResponse]:
    """List all files for the current user."""
    result = await db.execute(
        select(FileMetadata)
        .where(FileMetadata.user_id == current_user.id)
        .where(FileMetadata.status == "active")
        .order_by(FileMetadata.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    files = result.scalars().all()
    
    return [
        FileListResponse(
            id=str(f.id),
            original_filename=f.original_filename,
            file_size=f.file_size,
            mime_type=f.mime_type,
            created_at=f.created_at,
        )
        for f in files
    ]


@router.get("/{file_id}/download", response_model=FileDownloadResponse)
async def get_download_url(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> FileDownloadResponse:
    """Get presigned download URL for a file."""
    # Get file metadata
    result = await db.execute(
        select(FileMetadata).where(
            FileMetadata.id == file_id,
            FileMetadata.user_id == current_user.id,
            FileMetadata.status == "active",
        )
    )
    file_metadata = result.scalar_one_or_none()
    
    if not file_metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Generate presigned URLs for all chunks
    presigned_urls = []
    for i in range(file_metadata.chunk_count):
        object_name = f"{current_user.id}/{file_id}/chunk_{i}.enc"
        url = minio_client.get_presigned_download_url(object_name, expires_seconds=3600)
        presigned_urls.append(url)
    
    # Log download
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DOWNLOAD",
        resource="file",
        resource_id=file_id,
        details={"filename": file_metadata.original_filename},
    )
    db.add(audit_log)
    await db.commit()
    
    return FileDownloadResponse(
        file_id=str(file_metadata.id),
        original_filename=file_metadata.original_filename,
        file_size=file_metadata.file_size,
        mime_type=file_metadata.mime_type,
        iv=file_metadata.iv,
        checksum=file_metadata.checksum,
        chunk_count=file_metadata.chunk_count,
        presigned_urls=presigned_urls,
    )


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete a file and its chunks."""
    # Get file metadata
    result = await db.execute(
        select(FileMetadata).where(
            FileMetadata.id == file_id,
            FileMetadata.user_id == current_user.id,
        )
    )
    file_metadata = result.scalar_one_or_none()
    
    if not file_metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Delete chunks from MinIO
    for i in range(file_metadata.chunk_count):
        object_name = f"{current_user.id}/{file_id}/chunk_{i}.enc"
        try:
            minio_client.delete_object(object_name)
        except Exception:
            pass  # Continue deleting other chunks
    
    # Soft delete in database
    file_metadata.status = "deleted"
    
    # Log deletion
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE",
        resource="file",
        resource_id=file_id,
        details={"filename": file_metadata.original_filename},
    )
    db.add(audit_log)
    await db.commit()
    
    return {"success": True, "message": "File deleted successfully"}