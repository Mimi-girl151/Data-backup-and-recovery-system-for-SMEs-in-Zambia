#!/bin/bash

# Health check script for monitoring services

echo "Checking Secure Backup System Health..."
echo "=========================================="

# Check PostgreSQL
if docker exec backup-postgres pg_isready -U backupuser > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not responding"
fi

# Check MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo "✅ MinIO: Running"
else
    echo "❌ MinIO: Not responding"
fi

# Check Backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API: Running"
else
    echo "❌ Backend API: Not responding"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not responding"
fi

echo "=========================================="