#!/bin/bash

# Secure Backup System Deployment Script

set -e

echo "=========================================="
echo "Secure Backup System - Deployment Script"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your configuration"
    exit 1
fi

# Create necessary directories
echo "Creating required directories..."
mkdir -p postgres/data
mkdir -p minio/data
mkdir -p frontend/dist

# Build and start services
echo "Starting services with Docker Compose..."
docker compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker compose ps

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:8000"
echo "  API Docs:     http://localhost:8000/docs"
echo "  MinIO Console: http://localhost:9001"
echo ""
echo "Default Credentials:"
echo "  Admin: admin@securebackup.com / admin123"
echo "  Demo:  demo@securebackup.com / demo1234"
echo "  MinIO: minioadmin / minioadmin123"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
echo "=========================================="