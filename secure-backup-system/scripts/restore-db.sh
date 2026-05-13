#!/bin/bash
# ============================================
# PostgreSQL Restore Script for VaultGuard
# ============================================
# Usage: ./restore-db.sh <backup_file.sql.gz>
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}❌ ERROR: No backup file specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -la /backups/postgres/*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ ERROR: File not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will OVERWRITE the current database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting restore from $BACKUP_FILE..."

gunzip -c $BACKUP_FILE | docker exec -i backup-postgres psql -U backupuser backupdb

if [ $? -eq 0 ]; then
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}✅ Restore completed successfully${NC}"
else
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}❌ Restore failed!${NC}"
    exit 1
fi
