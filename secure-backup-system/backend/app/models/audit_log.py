from datetime import datetime
from uuid import uuid4
from sqlalchemy import String, DateTime, Index, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base


class AuditLog(Base):
    """Audit log model for tracking user actions."""
    
    __tablename__ = "audit_log"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default="gen_random_uuid()"
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    resource: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )
    resource_id: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )
    ip_address: Mapped[str] = mapped_column(
        INET,
        nullable=True
    )
    user_agent: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )
    details: Mapped[dict] = mapped_column(
        JSONB,
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    
    __table_args__ = (
        Index("idx_audit_log_user_id", "user_id"),
        Index("idx_audit_log_action", "action"),
        Index("idx_audit_log_created_at", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action={self.action}, user_id={self.user_id})>"