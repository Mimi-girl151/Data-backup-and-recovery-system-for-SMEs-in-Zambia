from datetime import datetime
from uuid import uuid4
from sqlalchemy import String, BigInteger, Integer, DateTime, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base


class FileMetadata(Base):
    """File metadata model for tracking backed-up files."""
    
    __tablename__ = "file_metadata"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default="gen_random_uuid()"
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )
    iv: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Initialization vector for AES-256-GCM"
    )
    checksum: Mapped[str] = mapped_column(
        String(128),
        nullable=True,
        comment="SHA-256 checksum for integrity verification"
    )
    chunk_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Number of chunks for large files"
    )
    encrypted_path: Mapped[str] = mapped_column(
        String(500),
        nullable=True,
        comment="Path to encrypted file in MinIO"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
        comment="active, deleted, corrupted"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    # Relationships
    user = relationship("User", back_populates="files")
    
    # Indexes
    __table_args__ = (
        Index("idx_file_metadata_user_id", "user_id"),
        Index("idx_file_metadata_status", "status"),
        Index("idx_file_metadata_created_at", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<FileMetadata(id={self.id}, filename={self.original_filename}, user_id={self.user_id})>"