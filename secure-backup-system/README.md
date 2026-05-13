# 🔐 VaultGuard - Secure Backup System for SMEs

A **zero-knowledge**, enterprise-grade backup system designed specifically for Small and Medium Enterprises (SMEs) in Zambia. Files are encrypted **client-side** with AES-256-GCM before they ever leave your browser. The server never sees your unencrypted data or your encryption password.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- **Zero-Knowledge Architecture** - Files encrypted client-side; server never sees plaintext
- **AES-256-GCM Encryption** - Industry-standard encryption with 256-bit keys
- **PBKDF2 Key Derivation** - 600,000 iterations (OWASP 2024 compliant)
- **Secure Authentication** - JWT tokens with bcrypt password hashing
- **Role-Based Access Control** - Admin and Standard User roles

### Storage & Infrastructure
- **MinIO Object Storage** - S3-compatible, self-hosted storage
- **PostgreSQL Database** - Metadata and audit logging
- **3-Tier Network Isolation** - Web, App, and Data networks separated
- **Docker Containerization** - Easy deployment with Docker Compose
- **Nginx Reverse Proxy** - TLS termination and security headers

### Security Hardening
- **Rate Limiting** - Prevents brute force attacks (5/min login attempts)
- **Non-Root Containers** - CIS Docker benchmark compliant
- **Security Headers** - CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Audit Logging** - All user actions tracked
- **Docker Secrets** - Credentials never exposed in environment variables

### User Features
- User Registration & Login
- Encrypted File Upload
- File Recovery with Decryption
- Dashboard with Storage Statistics
- Password Change
- Audit Trail of Actions

---

## 🛠 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + Vite | 18.x / 5.x |
| **Backend** | FastAPI (Python) | 0.104.1 |
| **Database** | PostgreSQL | 15 |
| **Storage** | MinIO | Latest |
| **Proxy** | Nginx | 1.25 |
| **Container** | Docker + Docker Compose | 24.x |
| **Encryption** | Web Crypto API | Native |
| **Authentication** | JWT + bcrypt | - |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                    │
│                         http://localhost                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NGINX (Port 80/443)                            │
│                    SSL Termination, Security Headers                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
            ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
            │  Frontend   │    │   Backend   │    │   MinIO     │
            │   React     │    │  FastAPI    │    │  Storage    │
            │   :5173     │    │   :8000     │    │   :9000     │
            └─────────────┘    └──────┬──────┘    └─────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   PostgreSQL    │
                            │   :5432         │
                            └─────────────────┘
```

### Network Segmentation

| Tier | Network | Services | Access |
|------|---------|----------|--------|
| **Web** | `web-nw` | Nginx | Public (80/443) |
| **App** | `app-nw` | Frontend, Backend | Internal only |
| **Data** | `data-nw` | PostgreSQL, MinIO | Completely isolated |

---

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- 4GB+ RAM (8GB recommended)
- 20GB+ free disk space

### Installation

```bash
# Clone the repository
git clone https://github.com/Mimi-girl151/Data-backup-and-recovery-system-for-SMEs-in-Zambia.git
cd secure-backup-system

# Create secrets directory
mkdir -p secrets

# Generate secrets
echo "backupuser" > secrets/db_user.txt
echo "backuppass123" > secrets/db_password.txt
echo "backupdb" > secrets/db_name.txt
echo "your-super-secret-jwt-key" > secrets/jwt_secret.txt
echo "minioadmin" > secrets/minio_user.txt
echo "minioadmin123" > secrets/minio_password.txt

# Set permissions
chmod 600 secrets/*.txt

# Create .env file
cat > .env << 'EOF'
VITE_API_URL=http://localhost
FRONTEND_PORT=5173
BACKEND_PORT=8000
ENVIRONMENT=development
DEBUG=true
DB_PORT=5435
EOF

# Start the system
docker compose up -d

# Wait for services to initialize
sleep 15

# Run database migrations (if needed)
docker exec backup-backend alembic upgrade head
```

### Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost | Register or use demo account |
| **Backend API** | http://localhost/api | - |
| **API Docs** | http://localhost/api/docs | - |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |

### Default Users

| Email | Password | Role |
|-------|----------|------|
| admin@securebackup.com | admin123 | Admin |
| demo@securebackup.com | demo1234 | User |

---

## 🔒 Security

### Encryption Standards

| Component | Standard | Details |
|-----------|----------|---------|
| **File Encryption** | AES-256-GCM | Authenticated encryption |
| **Key Derivation** | PBKDF2 | 600,000 iterations |
| **Password Hashing** | bcrypt | 12 rounds |
| **Transport Security** | TLS 1.3 | Via Nginx |
| **JWT Signing** | HS256 | 24-hour expiry |

### Security Headers

```nginx
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 per minute |
| `/auth/register` | 10 per minute |
| `/auth/change-password` | 3 per minute |

---

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Change password |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload encrypted file chunk |
| GET | `/api/files/list` | List user files |
| GET | `/api/files/{id}/download` | Get presigned download URL |
| DELETE | `/api/files/{id}` | Delete file |
| GET | `/api/files/stats` | Get storage statistics |

---

## 📁 Project Structure

```
secure-backup-system/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core logic (MinIO, security)
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── db/             # Database connection
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── crypto/        # AES-256-GCM encryption
│   │   ├── modules/       # Page components
│   │   └── store/         # Zustand state
│   └── package.json
├── nginx/                  # Nginx configuration
├── scripts/                # Backup and utility scripts
├── secrets/                # Docker secrets (not committed)
├── docker-compose.yml
└── README.md
```

---

## 🧪 Testing

### Run Backend Tests

```bash
docker compose exec backend pytest
```

### Run Frontend Tests

```bash
docker compose exec frontend npm test
```

### Test Health Checks

```bash
# Light health check
curl http://localhost/api/health

# Deep health check (tests DB + MinIO)
curl http://localhost/api/health/deep
```

---

## 📦 Backup & Recovery

### Database Backup

```bash
# Run manual backup
./scripts/backup-db.sh

# Backups stored in /backups/postgres/
# Retention: 7 days
```

### Database Restore

```bash
# Restore from backup
./scripts/restore-db.sh /backups/postgres/backup_20260101.sql.gz
```

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Port already in use** | Change ports in `.env` file |
| **MinIO storage full** | Run `docker system prune -a` or delete old files |
| **CORS errors** | Access app through http://localhost (not :5173) |
| **Backend not starting** | Check logs: `docker compose logs backend` |

### Useful Commands

```bash
# View all logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Rebuild and restart
docker compose build --no-cache && docker compose up -d

# Check container status
docker compose ps

# Access database
docker exec -it backup-postgres psql -U backupuser -d backupdb
```

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Authors

- **Mirika Ziela** - *Project Lead* - Mulungushi University

---

## 🙏 Acknowledgments

- Mulungushi University - Department of Computer Science and IT
- Supervisor: Mrs Mulwanda

---

## 📧 Contact

For questions or support, please open an issue on GitHub.
