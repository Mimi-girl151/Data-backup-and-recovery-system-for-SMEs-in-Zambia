# Module Architecture Document
## Secure Data Backup and Recovery System for SMEs (MVP)

**Document Version:** 1.0 (MVP Focused)
**Date:** April 1, 2026
**Project:** Secure Data Backup and Recovery System for SMEs
**Prepared for:** Mirika Ziela (Capstone Project)
**Repository Type:** Monorepo (All code in one place)

---

### 1. Introduction

#### 1.1 Purpose
This document defines the modular architecture of the Secure Data Backup and Recovery System. It provides a clear blueprint for organizing code into logical, independent modules that can be developed, tested, and maintained separately. This structure ensures that the development team can work in parallel and quickly identify where to make changes.

#### 1.2 Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Each module has a single, well-defined responsibility |
| **Zero-Knowledge Security** | Backend never sees unencrypted user data |
| **Modularity** | Modules can be developed and tested independently |
| **Scalability** | Structure supports future feature additions |
| **Developer Productivity** | Clear folder organization reduces cognitive load |

---

### 2. Logical Module Overview

The system is divided into **5 Core Functional Modules**. Each module is isolated and communicates through well-defined interfaces.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM MODULES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │      Auth       │    │     Crypto      │    │     Storage     │          │
│  │     Module      │    │     Engine      │    │    Service      │          │
│  │                 │    │                 │    │                 │          │
│  │ - Registration  │    │ - AES-256-GCM   │    │ - MinIO Client  │          │
│  │ - Login         │    │ - Key Derivation│    │ - Bucket Mgmt   │          │
│  │ - JWT Tokens    │    │ - Chunking      │    │ - Upload/Download│          │
│  │ - Password Hash │    │ - IV Generation │    │ - Presigned URLs│          │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘          │
│           │                      │                      │                    │
│           └──────────────────────┼──────────────────────┘                    │
│                                  │                                           │
│                    ┌─────────────▼─────────────┐                            │
│                    │        Metadata           │                            │
│                    │         Module            │                            │
│                    │                           │                            │
│                    │ - File Metadata Storage   │                            │
│                    │ - User-File Association   │                            │
│                    │ - Version Tracking        │                            │
│                    └─────────────┬─────────────┘                            │
│                                  │                                           │
│                    ┌─────────────▼─────────────┐                            │
│                    │        Dashboard          │                            │
│                    │         Module            │                            │
│                    │                           │                            │
│                    │ - Storage Visualization   │                            │
│                    │ - Activity Logs           │                            │
│                    │ - File Browser            │                            │
│                    └───────────────────────────┘                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2.1 Module Descriptions

| Module | Location | Responsibility | Key Technologies |
|--------|----------|----------------|------------------|
| **Auth & Identity** | Backend + Frontend | User registration, login, session management, role-based access | JWT, bcrypt, React Context |
| **Crypto Engine** | Frontend (Client-side) | AES-256 encryption/decryption, key derivation, file chunking | Web Crypto API, PBKDF2 |
| **Storage Service** | Backend | Communication with MinIO, bucket management, file operations | MinIO SDK, Presigned URLs |
| **Metadata** | Backend + PostgreSQL | Store file metadata, user associations, audit logs | SQLAlchemy, PostgreSQL |
| **Dashboard** | Frontend | UI for file management, storage visualization, user settings | React, Recharts, Axios |

---

### 3. Physical Folder Structure (Monorepo)

All code resides in a single repository organized as follows:

```
secure-backup-system/                           # Project Root
│
├── docker-compose.yml                          # Master orchestration file
├── .env                                        # Environment variables (never commit)
├── .env.example                                # Example env file for setup
├── .gitignore                                  # Git ignore rules
├── README.md                                   # Project documentation
│
├── backend/                                    # PYTHON FASTAPI BACKEND
│   ├── Dockerfile                              # Backend container build
│   ├── requirements.txt                        # Python dependencies
│   ├── requirements-dev.txt                    # Dev dependencies (testing)
│   ├── alembic/                                # Database migrations
│   │   ├── versions/
│   │   └── alembic.ini
│   │
│   └── app/                                    # Application source code
│       ├── __init__.py
│       ├── main.py                             # FastAPI app entry point
│       ├── config.py                           # Configuration (env loading)
│       │
│       ├── api/                                # API ROUTES (v1 endpoints)
│       │   ├── __init__.py
│       │   ├── deps.py                         # Dependencies (get_db, get_current_user)
│       │   ├── auth.py                         # /auth/register, /auth/login, /auth/me
│       │   ├── files.py                        # /files/upload, /files/list, /files/{id}
│       │   └── dashboard.py                    # /dashboard/stats, /dashboard/activity
│       │
│       ├── core/                               # CORE BUSINESS LOGIC
│       │   ├── __init__.py
│       │   ├── security.py                     # Password hashing, JWT creation/verify
│       │   ├── minio_client.py                 # MinIO client singleton
│       │   └── exceptions.py                   # Custom exception classes
│       │
│       ├── models/                             # SQLALCHEMY DATABASE MODELS
│       │   ├── __init__.py
│       │   ├── user.py                         # User table model
│       │   ├── file_metadata.py                # FileMetadata table model
│       │   └── audit_log.py                    # AuditLog table model
│       │
│       ├── schemas/                            # PYDANTIC SCHEMAS (Validation)
│       │   ├── __init__.py
│       │   ├── user.py                         # UserCreate, UserResponse, UserLogin
│       │   ├── file.py                         # FileUploadResponse, FileListResponse
│       │   └── common.py                       # Pagination, ErrorResponse
│       │
│       ├── services/                           # SERVICE LAYER (Business Logic)
│       │   ├── __init__.py
│       │   ├── user_service.py                 # User CRUD operations
│       │   ├── file_service.py                 # File metadata operations
│       │   └── audit_service.py                # Audit logging
│       │
│       └── db/                                 # DATABASE CONNECTION
│           ├── __init__.py
│           ├── session.py                      # Database engine and session factory
│           └── base.py                         # Declarative base for models
│
├── frontend/                                   # REACT.JS FRONTEND
│   ├── Dockerfile                              # Multi-stage build (build + nginx)
│   ├── Dockerfile.dev                          # Dev container with hot reload
│   ├── package.json                            # Node dependencies
│   ├── package-lock.json
│   ├── vite.config.js                          # Vite build configuration
│   ├── index.html                              # Entry HTML
│   │
│   ├── public/                                 # Static assets
│   │   └── favicon.ico
│   │
│   └── src/                                    # Source code
│       ├── main.jsx                            # React entry point
│       ├── App.jsx                             # Root component (Routes, Providers)
│       ├── index.css                           # Global styles (Tailwind)
│       │
│       ├── api/                                # API CLIENT LAYER
│       │   ├── client.js                       # Axios instance (baseURL, interceptors)
│       │   ├── auth.js                         # authApi.login(), authApi.register()
│       │   ├── files.js                        # filesApi.upload(), filesApi.list()
│       │   └── dashboard.js                    # dashboardApi.getStats()
│       │
│       ├── store/                              # STATE MANAGEMENT (Zustand)
│       │   ├── index.js                        # Export all stores
│       │   ├── authStore.js                    # user, token, login, logout actions
│       │   ├── fileStore.js                    # fileList, uploadProgress, selectedFile
│       │   └── uiStore.js                      # theme, toast, loading states
│       │
│       ├── hooks/                              # CUSTOM REACT HOOKS
│       │   ├── useAuth.js                      # useAuth, useRequireAuth
│       │   ├── useUpload.js                    # useUpload (handles encryption + upload)
│       │   └── useToast.js                     # Notification management
│       │
│       ├── utils/                              # UTILITY FUNCTIONS
│       │   ├── formatBytes.js                  # Convert bytes to human-readable
│       │   ├── validateFile.js                 # File type/size validation
│       │   └── dateFormatter.js                # Format timestamps
│       │
│       ├── crypto/                             # CRYPTO ENGINE MODULE
│       │   ├── index.js                        # Public API exports
│       │   ├── aes-gcm.js                      # Encrypt/decrypt using Web Crypto API
│       │   ├── key-derivation.js               # PBKDF2 key derivation from password
│       │   ├── chunker.js                      # File chunking/stitching logic
│       │   └── integrity.js                    # Checksum generation/verification
│       │
│       ├── modules/                            # FEATURE MODULES (Page-based)
│       │   ├── Auth/                           # AUTH MODULE
│       │   │   ├── Login.jsx                   # Login page component
│       │   │   ├── Register.jsx                # Registration page
│       │   │   └── ProtectedRoute.jsx          # Route guard component
│       │   │
│       │   ├── Dashboard/                      # DASHBOARD MODULE
│       │   │   ├── DashboardHome.jsx           # Main dashboard view
│       │   │   ├── StorageChart.jsx            # Storage usage chart (Recharts)
│       │   │   ├── ActivityTimeline.jsx        # Recent activity list
│       │   │   └── StatsCards.jsx              # Summary cards (files, storage, etc.)
│       │   │
│       │   ├── Backup/                         # BACKUP MODULE
│       │   │   ├── BackupPage.jsx              # Main backup view
│       │   │   ├── UploadArea.jsx              # Drag-and-drop upload zone
│       │   │   ├── UploadProgress.jsx          # Progress bar for upload
│       │   │   ├── FileSelector.jsx            # File picker component
│       │   │   └── BackupHistory.jsx           # Recently backed up files
│       │   │
│       │   ├── Recovery/                       # RECOVERY MODULE
│       │   │   ├── RecoveryPage.jsx            # Main recovery view
│       │   │   ├── FileBrowser.jsx             # Browse and search files
│       │   │   ├── FileListItem.jsx            # Individual file row (with restore button)
│       │   │   ├── RestoreDialog.jsx           # Confirmation dialog for restore
│       │   │   └── DownloadManager.jsx         # Handles download and decryption
│       │   │
│       │   └── Settings/                       # SETTINGS MODULE
│       │       ├── SettingsPage.jsx            # Main settings view
│       │       ├── ChangePassword.jsx          # Password change form
│       │       ├── AccountDelete.jsx           # Account deletion with confirmation
│       │       └── ApiKeys.jsx                 # API key management (future)
│       │
│       ├── components/                         # SHARED UI COMPONENTS
│       │   ├── Layout/
│       │   │   ├── MainLayout.jsx              # Wrapper with sidebar and header
│       │   │   ├── Sidebar.jsx                 # Navigation menu
│       │   │   ├── Header.jsx                  # Top bar with user menu
│       │   │   └── Footer.jsx
│       │   ├── Common/
│       │   │   ├── Button.jsx                  # Reusable button
│       │   │   ├── Modal.jsx                   # Modal dialog
│       │   │   ├── Toast.jsx                   # Notification toast
│       │   │   ├── Spinner.jsx                 # Loading indicator
│       │   │   ├── Card.jsx                    # Card container
│       │   │   └── Table.jsx                   # Data table
│       │   └── Forms/
│       │       ├── Input.jsx                   # Text input
│       │       ├── FileInput.jsx               # File upload input
│       │       └── PasswordInput.jsx           # Password with visibility toggle
│       │
│       └── styles/                             # STYLES (if not using Tailwind)
│           └── globals.css
│
├── nginx/                                      # NGINX REVERSE PROXY
│   ├── nginx.conf                              # Main configuration
│   ├── nginx.dev.conf                          # Dev configuration
│   └── security-headers.conf                   # Security headers config
│
├── minio/                                      # MINIO STORAGE (Optional config)
│   └── data/                                   # MinIO data directory (mounted volume)
│
├── postgres/                                   # POSTGRES DATA (mounted volume)
│   └── data/                                   # Database files
│
├── scripts/                                    # UTILITY SCRIPTS
│   ├── init-db.sql                             # Initial database setup
│   ├── generate-ssl.sh                         # Generate self-signed SSL certs
│   ├── deploy.sh                               # Deployment script
│   ├── backup.sh                               # System backup script
│   └── healthcheck.sh                          # Health check endpoint script
│
├── docs/                                       # DOCUMENTATION
│   ├── URS.md                                  # User Requirement Specification
│   ├── ARCHITECTURE.md                         # System Architecture
│   ├── MODULES.md                              # This document
│   └── API.md                                  # API Documentation (auto-generated)
│
└── tests/                                      # TESTING
    ├── backend/
    │   ├── unit/
    │   ├── integration/
    │   └── conftest.py
    └── frontend/
        ├── unit/
        └── e2e/
```

---

### 4. Module Details

#### 4.1 Auth & Identity Module

**Location:** `backend/app/api/auth.py`, `backend/app/core/security.py`, `frontend/modules/Auth/`

**Responsibilities:**
- User registration with email validation
- Password hashing using bcrypt
- JWT token generation and verification
- Session management
- Role assignment (admin/user)

**Data Flow:**
```
Frontend (Login.jsx) → API (auth.py) → Security (bcrypt verify) → JWT Generation → Response
```

**Key Interfaces:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate and receive JWT |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/logout` | POST | Invalidate token (client-side) |

---

#### 4.2 Crypto Engine Module

**Location:** `frontend/src/crypto/`

**Responsibilities:**
- AES-256-GCM encryption/decryption
- PBKDF2 key derivation from user password
- File chunking for large files
- Integrity verification (checksums)

**Key Functions:**

```javascript
// aes-gcm.js
export async function encryptFile(file, password) { ... }
export async function decryptFile(encryptedBlob, password, iv) { ... }

// key-derivation.js
export async function deriveKey(password, salt) { ... }

// chunker.js
export async function splitFile(file, chunkSize = 1024 * 1024) { ... }
export async function mergeChunks(chunks) { ... }
```

**Security Notes:**
- Encryption happens **entirely in the browser**
- Backend receives **only encrypted data**
- Encryption key is **never transmitted** to server
- IV is generated per file and stored with metadata

---

#### 4.3 Storage Service Module

**Location:** `backend/app/core/minio_client.py`, `backend/app/services/file_service.py`

**Responsibilities:**
- Connect to MinIO/S3-compatible storage
- Create and manage buckets
- Upload encrypted file chunks
- Generate presigned URLs for downloads
- Delete files from storage

**Key Classes:**

```python
# minio_client.py
class MinIOClient:
    def __init__(self): ...
    def create_bucket(self, bucket_name: str): ...
    def upload_file(self, bucket: str, object_name: str, data: bytes): ...
    def download_file(self, bucket: str, object_name: str) -> bytes: ...
    def delete_file(self, bucket: str, object_name: str): ...
    def generate_presigned_url(self, bucket: str, object_name: str, expiry: int): ...
```

---

#### 4.4 Metadata Module

**Location:** `backend/app/models/file_metadata.py`, `backend/app/services/file_service.py`, `backend/app/schemas/file.py`

**Responsibilities:**
- Store metadata about backed-up files
- Track user-file relationships
- Maintain audit logs
- Support file versioning (future)

**Database Schema:**

```sql
-- file_metadata table
CREATE TABLE file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    encrypted_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    iv TEXT NOT NULL,
    checksum VARCHAR(128),
    chunk_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 4.5 Dashboard Module

**Location:** `frontend/modules/Dashboard/`, `backend/app/api/dashboard.py`

**Responsibilities:**
- Display storage usage statistics
- Show recent activity
- Visualize backup trends
- Provide quick actions

**Key Components:**

| Component | Purpose |
|-----------|---------|
| `StorageChart.jsx` | Pie/bar chart of storage usage |
| `ActivityTimeline.jsx` | List of recent backup/restore actions |
| `StatsCards.jsx` | Summary cards (total files, storage used, last backup) |
| `QuickActions.jsx` | Buttons for common tasks |

---

### 5. Data Flow: File Upload (Complete Walkthrough)

This section traces a file upload through all modules:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                              │
│    User selects file in UploadArea.jsx                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CRYPTO ENGINE (Frontend)                                                 │
│    File passed to crypto/chunker.js → split into chunks (if > 10MB)        │
│    Each chunk encrypted via crypto/aes-gcm.js using derived key            │
│    Returns: { encryptedChunks: Blob[], iv: Uint8Array, checksum: string }  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. API CLIENT (Frontend)                                                    │
│    filesApi.upload(encryptedChunks, metadata)                               │
│    → POST /api/files/upload with multipart/form-data                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. BACKEND API (backend/app/api/files.py)                                   │
│    Validate JWT token → get current user                                    │
│    Receive encrypted chunks and metadata                                    │
│    Call file_service.create_file_metadata() to store in DB                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. STORAGE SERVICE (backend/app/core/minio_client.py)                       │
│    For each chunk: minio.upload_file(bucket, object_name, chunk_data)      │
│    Store in MinIO bucket: "backup-files/{user_id}/{file_id}/chunk_{n}.enc" │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. METADATA MODULE (backend/app/services/file_service.py)                   │
│    Save file metadata to PostgreSQL:                                        │
│    - original_filename, file_size, mime_type                                │
│    - iv (initialization vector)                                             │
│    - checksum for integrity verification                                    │
│    - chunk_count, encrypted_path                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. AUDIT LOG (backend/app/services/audit_service.py)                        │
│    Log: { action: "UPLOAD", user_id, resource: "file", details: {...} }    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 8. RESPONSE BACK TO FRONTEND                                                │
│    Backend returns { success: true, file_id: uuid, message: "Backup saved" }│
│    Frontend updates fileStore and shows success toast                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 6. Data Flow: File Recovery (Complete Walkthrough)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                              │
│    User browses files in FileBrowser.jsx → clicks "Restore"                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. API CLIENT (Frontend)                                                    │
│    filesApi.download(fileId) → GET /api/files/{id}/download                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. BACKEND API (backend/app/api/files.py)                                   │
│    Validate JWT, check user owns file                                       │
│    Query file metadata from PostgreSQL                                      │
│    Generate presigned URL from MinIO for encrypted chunks                   │
│    Return { presignedUrls: [...], iv, checksum, originalName }              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND DOWNLOAD MANAGER                                                │
│    Fetch encrypted chunks using presigned URLs                              │
│    Pass to crypto/merger.js → stitch chunks together                        │
│    Decrypt using crypto/aes-gcm.js with user password + stored IV          │
│    Verify checksum for integrity                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. USER RECEIVES FILE                                                       │
│    Browser downloads decrypted file with original filename                  │
│    Toast notification: "Restore complete"                                   │
│    Audit log entry created                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 7. Module Dependencies

```
                    ┌─────────────────┐
                    │   Auth Module   │
                    └────────┬────────┘
                             │ (JWT token)
                             ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Crypto Engine   │───▶│   API Client    │◀───│   Dashboard     │
│ (Frontend only) │    │                 │    │                 │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │     Backend API         │
                    │  (auth.py, files.py)    │
                    └───────────┬─────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  Storage Service  │ │  Metadata Module  │ │  Audit Service    │
│   (MinIO)         │ │   (PostgreSQL)    │ │   (PostgreSQL)    │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

### 8. Development Guidelines

#### 8.1 Adding a New Feature

1. **Frontend:** Add new component in appropriate `modules/` subfolder
2. **API Client:** Add new function in `api/` folder
3. **Backend:** Add new endpoint in `api/` folder
4. **Service:** Add business logic in `services/` folder
5. **Model:** Add database model if needed in `models/` folder
6. **Schema:** Add Pydantic schema for validation in `schemas/` folder

#### 8.2 Code Organization Rules

| Rule | Description |
|------|-------------|
| **One module per folder** | Each module has its own folder with related files |
| **Shared code in components/** | Reusable UI components go here, not in modules |
| **API calls only in api/** | No direct fetch/axios calls in components |
| **State only in store/** | Global state managed by Zustand stores |
| **Utils are pure functions** | No side effects in utility functions |
| **Crypto isolated** | All encryption code in crypto/ folder |

#### 8.3 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UploadArea.jsx` |
| Utility Functions | camelCase | `formatBytes.js` |
| API Functions | camelCase | `filesApi.upload()` |
| Store Files | camelCase + Store | `authStore.js` |
| Backend Models | snake_case | `file_metadata.py` |
| Backend Schemas | PascalCase | `FileUploadResponse` |

---

### 9. Summary

This module architecture provides:

| Benefit | Description |
|---------|-------------|
| **Clarity** | Every file has a clear home; developers know where to look |
| **Parallel Development** | Frontend and backend can be developed simultaneously |
| **Testability** | Each module can be tested in isolation |
| **Security** | Crypto module isolated, zero-knowledge architecture enforced |
| **Scalability** | Structure supports adding new features without refactoring |
| **Maintainability** | Clear separation of concerns reduces bugs |

---

**Next Steps:**
1. Set up the Docker Compose file to orchestrate all containers
2. Initialize the PostgreSQL database with the schema
3. Set up MinIO storage bucket
4. Begin implementing the Crypto Engine module
5. Build the Auth module