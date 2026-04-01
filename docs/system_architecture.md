# System Architecture Document
## Secure Data Backup and Recovery System for SMEs (MVP)

**Document Version:** 1.0 (MVP Focused)
**Date:** April 1, 2026
**Project:** Secure Data Backup and Recovery System for SMEs
**Prepared for:** Mirika Ziela (Capstone Project)
**Host Platform:** Ubuntu Server 22.04 LTS / 24.04 LTS

---

### 1. Introduction

#### 1.1 Purpose
This document describes the high-level system architecture for the Minimum Viable Product (MVP) of the Secure Data Backup and Recovery System. It outlines the components, their interactions, data flow, and technology choices required to implement the functional requirements defined in the URS.

#### 1.2 Scope
The architecture covers a web-based application deployed on an **Ubuntu Server** using Docker Compose. It includes:
- Frontend client (React.js)
- Backend API server (Node.js/Express or Python Flask)
- Database (PostgreSQL)
- File storage (Local filesystem via Docker volume)
- Encryption layer (Web Crypto API on client-side)
- Ubuntu Server as the host operating system

#### 1.3 Host Environment Overview
All components will run on a single **Ubuntu Server** instance (physical or virtual). Docker containers will be orchestrated using Docker Compose, with persistent data stored in Docker volumes mounted to the Ubuntu filesystem.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UBUNTU SERVER 22.04/24.04 LTS                       │
│                              (Host Operating System)                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         DOCKER ENGINE                                │    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │    │
│  │  │   Nginx     │  │   Backend   │  │  PostgreSQL │  │   Storage   │ │    │
│  │  │  Container  │  │  Container  │  │  Container  │  │   Volume    │ │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                              Ubuntu Filesystem                              │
│                    /var/backup-system/data/                                 │
│                    /var/backup-system/logs/                                 │
│                    /etc/backup-system/ssl/                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Architectural Overview

The system follows a **client-server architecture** with a focus on **security by design**. The entire application stack runs on **Ubuntu Server**, containerized with Docker for consistency and ease of deployment.

#### 2.1 High-Level Diagram (Ubuntu Server Context)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                    │
│                    (Windows, macOS, Linux, Mobile)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                               HTTPS/TLS 1.3
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UBUNTU SERVER 22.04/24.04 LTS                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Nginx (Reverse Proxy Container)                   │    │
│  │              - SSL Termination                                       │    │
│  │              - Static File Serving (React build)                     │    │
│  │              - Request Routing to Backend                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│         ┌────────────────────────────┼────────────────────────────┐         │
│         ▼                            ▼                            ▼         │
│  ┌──────────────┐           ┌──────────────┐           ┌──────────────┐     │
│  │   Backend    │           │  PostgreSQL  │           │   File       │     │
│  │   API        │◄─────────►│  Database    │           │   Storage    │     │
│  │   Container  │           │  Container   │           │   (Volume)   │     │
│  │              │           │              │           │              │     │
│  │ - Auth       │           │ - Users      │           │ - Encrypted  │     │
│  │ - File Mgmt  │           │ - Metadata   │           │   Files      │     │
│  │ - REST API   │           │ - Logs       │           │              │     │
│  └──────────────┘           └──────────────┘           └──────────────┘     │
│         │                            │                            │         │
│         └────────────────────────────┼────────────────────────────┘         │
│                                      │                                      │
│                           ┌──────────▼──────────┐                          │
│                           │   Ubuntu Filesystem  │                          │
│                           │  /var/backup-system/ │                          │
│                           └──────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Ubuntu Server Configuration

#### 3.1 Operating System Specifications

| Component | Specification |
|-----------|---------------|
| **OS** | Ubuntu Server 22.04 LTS (Jammy Jellyfish) or 24.04 LTS (Noble Numbat) |
| **Kernel** | Linux 5.15+ (22.04) or 6.8+ (24.04) |
| **Architecture** | x86_64 (AMD64) |
| **Minimum RAM** | 4 GB (8 GB recommended) |
| **Minimum Storage** | 20 GB (50 GB+ recommended for backups) |
| **CPU** | 2+ cores |

#### 3.2 Required Ubuntu Packages

| Package | Purpose | Installation Command |
|---------|---------|---------------------|
| Docker Engine | Container runtime | `sudo apt install docker.io` |
| Docker Compose | Container orchestration | `sudo apt install docker-compose-plugin` |
| UFW | Firewall management | `sudo apt install ufw` |
| Fail2ban | Intrusion prevention | `sudo apt install fail2ban` |
| OpenSSL | SSL certificate generation | `sudo apt install openssl` |
| Git | Version control | `sudo apt install git` |

#### 3.3 Ubuntu Directory Structure

All application files will be organized under `/var/backup-system/` following Linux Filesystem Hierarchy Standard (FHS) conventions.

```
/var/backup-system/
├── docker/
│   ├── docker-compose.yml
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── data/
│   ├── postgres/          # PostgreSQL data (Docker volume)
│   └── uploads/           # Encrypted file storage
│       └── {user_id}/
│           └── {file_id}.enc
├── logs/
│   ├── nginx/
│   ├── backend/
│   └── postgres/
├── ssl/
│   ├── cert.pem           # SSL certificate
│   └── key.pem            # Private key
├── scripts/
│   ├── deploy.sh          # Deployment script
│   ├── backup.sh          # System backup script
│   └── healthcheck.sh     # Health monitoring script
└── config/
    ├── nginx.conf
    └── .env.production
```

---

### 4. Component Description

#### 4.1 Ubuntu Host Layer

| Aspect | Details |
|--------|---------|
| **Purpose** | Provides the operating system foundation for all containers |
| **Key Responsibilities** | - Manage Docker daemon<br>- Handle system-level security (UFW, fail2ban)<br>- Provide persistent storage via mounted volumes<br>- Manage SSL certificates<br>- System updates and maintenance |

#### 4.2 Frontend (React.js)

| Aspect | Details |
|--------|---------|
| **Purpose** | Provides user interface and handles client-side encryption |
| **Key Libraries** | React.js, Axios (HTTP client), Web Crypto API (native) |
| **Deployment** | Built to static files, served by Nginx container |
| **Key Responsibilities** | - Render UI components (login, dashboard, backup, recovery)<br>- Manage application state<br>- Perform AES-256 encryption before upload<br>- Handle decryption of downloaded files<br>- Communicate with backend via REST API |

#### 4.3 Backend API (Node.js/Express or Python Flask)

| Aspect | Details |
|--------|---------|
| **Purpose** | Handles business logic, authentication, and file metadata management |
| **Key Libraries** | Express.js (Node) or Flask (Python), JWT, bcrypt, Multer (file handling) |
| **Deployment** | Docker container, exposed internally to Nginx |
| **Key Responsibilities** | - User authentication and session management (JWT)<br>- Store and retrieve file metadata<br>- Serve encrypted files for download<br>- Validate user permissions<br>- Log user activity |

#### 4.4 Database (PostgreSQL)

| Aspect | Details |
|--------|---------|
| **Purpose** | Stores structured data (users, file metadata, logs) |
| **Data Persistence** | Docker volume mapped to `/var/backup-system/data/postgres` |
| **Key Tables** | `users`, `files`, `sessions` (optional) |
| **Schema Highlights** | - `users`: id, email, password_hash, role, created_at<br>- `files`: id, user_id, original_filename, encrypted_path, iv, size, created_at |

#### 4.5 File Storage (Ubuntu Filesystem Volume)

| Aspect | Details |
|--------|---------|
| **Purpose** | Stores encrypted file blobs persistently on Ubuntu host |
| **Location** | `/var/backup-system/data/uploads/` |
| **Implementation** | Docker bind mount to Ubuntu filesystem |
| **Structure** | `/var/backup-system/data/uploads/{user_id}/{file_id}.enc` |
| **Backup** | Can be backed up using Ubuntu-native tools (rsync, tar) |

#### 4.6 Reverse Proxy (Nginx)

| Aspect | Details |
|--------|---------|
| **Purpose** | Handles SSL termination, serves static files, routes API requests |
| **Configuration** | `/var/backup-system/config/nginx.conf` |
| **SSL Certificates** | Stored in `/var/backup-system/ssl/` |
| **Key Responsibilities** | - Terminate HTTPS/TLS 1.3<br>- Serve built React static files<br>- Proxy API requests to backend container<br>- Handle file upload/download limits<br>- Log access and errors to `/var/backup-system/logs/nginx/` |

---

### 5. Deployment Architecture on Ubuntu

#### 5.1 Docker Compose Configuration

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:1.25-alpine
    container_name: backup-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/backup-system/config/nginx.conf:/etc/nginx/nginx.conf:ro
      - /var/backup-system/ssl:/etc/nginx/ssl:ro
      - /var/backup-system/frontend/build:/usr/share/nginx/html:ro
      - /var/backup-system/logs/nginx:/var/log/nginx
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - backup-network

  backend:
    build: /var/backup-system/backend
    container_name: backup-backend
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_SALT=${ENCRYPTION_SALT}
      - NODE_ENV=production
    volumes:
      - /var/backup-system/data/uploads:/app/storage
      - /var/backup-system/logs/backend:/app/logs
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - backup-network

  postgres:
    image: postgres:15-alpine
    container_name: backup-postgres
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - /var/backup-system/data/postgres:/var/lib/postgresql/data
      - /var/backup-system/logs/postgres:/var/log/postgresql
    restart: unless-stopped
    networks:
      - backup-network

networks:
  backup-network:
    driver: bridge
```

#### 5.2 Ubuntu Firewall Configuration (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important: do this before enabling)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optional: Allow only specific IPs for SSH
# sudo ufw allow from 192.168.1.0/24 to any port 22

# Check status
sudo ufw status verbose
```

#### 5.3 Ubuntu Security Hardening

| Security Measure | Implementation |
|------------------|----------------|
| **Fail2ban** | Protects SSH and web services from brute force attacks |
| **Automatic Security Updates** | `sudo apt install unattended-upgrades` |
| **AppArmor** | Enforces container security profiles |
| **System Logging** | All logs stored in `/var/backup-system/logs/` |
| **Regular Backups** | Cron job to backup `/var/backup-system/data/` |

---

### 6. Ubuntu Systemd Services

Create systemd service to ensure Docker containers start on boot:

```ini
# /etc/systemd/system/backup-system.service
[Unit]
Description=Secure Backup System Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/backup-system/docker
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=root

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl enable backup-system.service
sudo systemctl start backup-system.service
```

---

### 7. Data Flow Diagrams (Ubuntu Context)

#### 7.1 Backup Operation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │ Frontend │     │  Nginx   │     │ Backend  │     │ Storage  │
│ Browser  │     │ (React)  │     │ (Ubuntu) │     │Container │     │ (Volume) │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ 1. Select File │                │                │                │
     │───────────────>│                │                │                │
     │                │                │                │                │
     │                │ 2. Encrypt file│                │                │
     │                │ (AES-256)      │                │                │
     │                │                │                │                │
     │                │ 3. POST /upload│                │                │
     │                │────────────────>│                │                │
     │                │                │                │                │
     │                │                │ 4. Proxy to   │                │
     │                │                │ backend       │                │
     │                │                │───────────────>│                │
     │                │                │                │                │
     │                │                │                │ 5. Store file  │
     │                │                │                │ to Ubuntu FS   │
     │                │                │                │───────────────>│
     │                │                │                │                │
     │                │                │ 6. Response   │                │
     │                │                │<───────────────│                │
     │                │                │                │                │
     │                │ 7. Response    │                │                │
     │                │<────────────────│                │                │
     │                │                │                │                │
     │ 8. Show       │                │                │                │
     │ confirmation  │                │                │                │
     │<───────────────│                │                │                │
```

---

### 8. Ubuntu Server Management Commands

| Task | Command |
|------|---------|
| **Deploy system** | `cd /var/backup-system/docker && docker compose up -d` |
| **Stop system** | `cd /var/backup-system/docker && docker compose down` |
| **View logs** | `docker compose logs -f` |
| **Check container status** | `docker ps` |
| **Backup data** | `sudo tar -czf backup-$(date +%Y%m%d).tar.gz /var/backup-system/data/` |
| **Restore data** | `sudo tar -xzf backup-20260101.tar.gz -C /` |
| **Update SSL certs** | `sudo systemctl restart nginx` |
| **Monitor system** | `htop`, `docker stats`, `df -h` |

---

### 9. Technology Stack (Updated with Ubuntu)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Host OS** | Ubuntu Server | 22.04/24.04 LTS | Host operating system |
| **Container Runtime** | Docker Engine | 24.x | Container management |
| **Orchestration** | Docker Compose | 2.x | Multi-container orchestration |
| **Reverse Proxy** | Nginx | 1.25 | SSL termination, static serving |
| **Frontend** | React.js | 18.x | UI framework |
| | Web Crypto API | Native | Client-side encryption |
| **Backend** | Node.js | 20.x LTS | Runtime (or Python 3.11) |
| | Express.js | 4.x | API framework |
| **Database** | PostgreSQL | 15.x | Relational database |
| **Security** | UFW | - | Ubuntu firewall |
| | Fail2ban | - | Brute force protection |
| | OpenSSL | 3.x | SSL certificate management |
| **Monitoring** | Docker stats | - | Container metrics |
| | Ubuntu logs | - | System logs in `/var/log/` |

---

### 10. Ubuntu System Requirements Summary

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **OS** | Ubuntu Server 22.04 LTS | Ubuntu Server 24.04 LTS |
| **CPU** | 2 cores @ 2.0 GHz | 4 cores @ 2.5 GHz+ |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 20 GB | 50 GB+ (SSD preferred) |
| **Network** | 100 Mbps | 1 Gbps |
| **Docker Storage** | 10 GB free | 20 GB+ free |
| **Backup Storage** | 10 GB | Configurable based on needs |

---

### 11. Constraints & Assumptions (Updated)

| Category | Constraint/Assumption |
|----------|----------------------|
| **Host Platform** | Single Ubuntu Server instance (no clustering) |
| **Encryption** | User's password is used for key derivation; no separate key management system |
| **Storage** | Local Ubuntu filesystem only; no cloud storage integration |
| **Scalability** | MVP designed for single-instance deployment on Ubuntu |
| **Backup Schedule** | Manual/on-demand only; no automated scheduling |
| **Database Support** | No live database backups; users export manually |
| **Recovery** | File-level recovery only; no full system restore |
| **System Backup** | Ubuntu system backups handled separately (not part of application) |
| **Updates** | Manual updates via Docker image rebuild |

---

### 12. Glossary (Updated)

| Term | Definition |
|------|------------|
| **AES-256-GCM** | Advanced Encryption Standard with 256-bit key using Galois/Counter Mode for authenticated encryption |
| **Bind Mount** | Docker feature that mounts a host directory (Ubuntu filesystem) into a container |
| **Client-Side Encryption** | Encryption performed in the browser before data is sent to the server |
| **Docker Compose** | Tool for defining and running multi-container Docker applications on Ubuntu |
| **Fail2ban** | Intrusion prevention software that bans IPs showing malicious signs |
| **IV (Initialization Vector)** | Random value used to ensure identical plaintexts encrypt to different ciphertexts |
| **JWT (JSON Web Token)** | Compact, URL-safe token for representing claims between parties |
| **TLS 1.3** | Transport Layer Security version 1.3, the latest secure protocol for internet communications |
| **UFW (Uncomplicated Firewall)** | Default firewall management tool on Ubuntu |
| **Ubuntu LTS** | Long Term Support release, receives security updates for 5+ years |
| **Web Crypto API** | JavaScript API providing cryptographic operations in web browsers |

---

This architecture document now fully integrates Ubuntu Server as the host platform, providing a clear blueprint for deployment, management, and security hardening. The MVP can be demonstrated entirely on a single Ubuntu server, making it perfect for your capstone presentation. Good luck!