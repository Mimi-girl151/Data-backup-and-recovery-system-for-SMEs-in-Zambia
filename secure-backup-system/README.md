# Secure Backup System for SMEs

A secure, zero-knowledge data backup and recovery system designed for Small and Medium Enterprises.

## Features

- 🔐 **Client-side AES-256 Encryption** - Your data is encrypted before it leaves your browser
- 🚀 **Fast Recovery** - RTO ≤15 minutes, RPO ≤5 minutes
- 💻 **Cross-Platform** - Works on Windows, macOS, Linux, and mobile browsers
- 📦 **S3-Compatible Storage** - Uses MinIO for scalable object storage
- 🔑 **JWT Authentication** - Secure, stateless authentication
- 📊 **Dashboard** - Visualize storage usage and activity

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Zustand, Web Crypto API
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, PostgreSQL, MinIO
- **Infrastructure**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/secure-backup-system.git
cd secure-backup-system