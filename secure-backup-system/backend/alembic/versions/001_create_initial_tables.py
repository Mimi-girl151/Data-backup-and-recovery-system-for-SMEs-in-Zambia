"""create initial tables

Revision ID: 001
Revises: 
Create Date: 2026-04-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all tables for the backup system."""
    
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('full_name', sa.String(255)),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='user'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )
    
    # Create indexes for users
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    
    # Create file_metadata table
    op.create_table(
        'file_metadata',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_size', sa.BigInteger, nullable=False),
        sa.Column('mime_type', sa.String(100)),
        sa.Column('iv', sa.String(255), nullable=False),
        sa.Column('checksum', sa.String(128)),
        sa.Column('chunk_count', sa.Integer, nullable=False, server_default='1'),
        sa.Column('encrypted_path', sa.String(500)),
        sa.Column('status', sa.String(20), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_file_metadata_user_id',
        'file_metadata', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )
    
    # Create indexes for file_metadata
    op.create_index('idx_file_metadata_user_id', 'file_metadata', ['user_id'])
    op.create_index('idx_file_metadata_status', 'file_metadata', ['status'])
    op.create_index('idx_file_metadata_created_at', 'file_metadata', ['created_at'])
    
    # Create audit_log table
    op.create_table(
        'audit_log',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True)),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('resource', sa.String(100)),
        sa.Column('resource_id', sa.String(100)),
        sa.Column('ip_address', INET),
        sa.Column('user_agent', sa.Text),
        sa.Column('details', JSONB),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )
    
    # Add foreign key constraint for audit_log
    op.create_foreign_key(
        'fk_audit_log_user_id',
        'audit_log', 'users',
        ['user_id'], ['id'],
        ondelete='SET NULL'
    )
    
    # Create indexes for audit_log
    op.create_index('idx_audit_log_user_id', 'audit_log', ['user_id'])
    op.create_index('idx_audit_log_action', 'audit_log', ['action'])
    op.create_index('idx_audit_log_created_at', 'audit_log', ['created_at'])
    
    # Create trigger function for updated_at
    op.execute("""
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql'
    """)
    
    # Add trigger to users table
    op.execute("""
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    """)
    
    # Add trigger to file_metadata table
    op.execute("""
    CREATE TRIGGER update_file_metadata_updated_at
        BEFORE UPDATE ON file_metadata
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    """)


def downgrade() -> None:
    """Drop all tables."""
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_users_updated_at ON users")
    op.execute("DROP TRIGGER IF EXISTS update_file_metadata_updated_at ON file_metadata")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")
    
    # Drop tables
    op.drop_table('audit_log')
    op.drop_table('file_metadata')
    op.drop_table('users')