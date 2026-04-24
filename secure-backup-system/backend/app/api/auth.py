from datetime import timedelta
from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token
)
from app.api.deps import get_current_active_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password"
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    Register a new user.
    
    Args:
        user_data: User registration data (email, password, full_name)
        db: Database session
        
    Returns:
        UserResponse: Created user information
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role="user",
        is_active=True
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Ensure id is properly typed
    user_id: UUID = new_user.id  # type: ignore[assignment]
    
    return UserResponse(
        id=user_id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active,
        created_at=new_user.created_at
    )


@router.post(
    "/login",
    response_model=Token,
    summary="Login to get access token",
    description="Authenticate user and return JWT access token"
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Login user and return JWT token.
    
    Args:
        credentials: User login credentials (email, password)
        db: Database session
        
    Returns:
        Token: JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with string UUID
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),  # Convert UUID to string for JWT
            "email": user.email,
            "role": user.role
        },
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user"
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserResponse:
    """
    Get current authenticated user.
    
    Args:
        current_user: User from dependency
        
    Returns:
        UserResponse: Current user information
    """
    return UserResponse(
        id=current_user.id,  # type: ignore[arg-type]
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


@router.post(
    "/change-password",
    summary="Change user password",
    description="Change password for the currently authenticated user"
)
async def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Change user password.
    Requires old password for verification.
    
    Args:
        old_password: Current password
        new_password: New password (min 8 characters)
        current_user: Authenticated user
        db: Database session
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If old password is incorrect or new password too short
    """
    # Verify old password
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Validate new password length
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )
    
    # Hash new password
    current_user.hashed_password = get_password_hash(new_password)
    
    # Log password change
    audit_log = AuditLog(
        user_id=current_user.id,
        action="PASSWORD_CHANGE",
        resource="user",
        resource_id=str(current_user.id),
        details={"email": current_user.email},
    )
    db.add(audit_log)
    
    await db.commit()
    
    return {"success": True, "message": "Password changed successfully"}