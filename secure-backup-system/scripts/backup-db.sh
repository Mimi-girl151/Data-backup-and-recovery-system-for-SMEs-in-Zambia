#!/bin/bash
# ============================================
# PostgreSQL Backup Script for VaultGuard
# ============================================
# Run daily via cron: 0 2 * * * /path/to/scripts/backup-db.sh
# ============================================

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "[$TIMESTAMP] Starting database backup..."

# Create backup
docker exec backup-postgres pg_dump -U backupuser backupdb > $BACKUP_DIR/backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo "[$TIMESTAMP] Backup successful: backup_$DATE.sql"
    
    # Compress
    gzip -f $BACKUP_DIR/backup_$DATE.sql
    echo "[$TIMESTAMP] Compressed: backup_$DATE.sql.gz"
    
    # Get file size
    FILE_SIZE=$(du -h $BACKUP_DIR/backup_$DATE.sql.gz | cut -f1)
    echo "[$TIMESTAMP] Backup size: $FILE_SIZE"
else
    echo "[$TIMESTAMP] ❌ BACKUP FAILED!"
    exit 1
fi

# Remove old backups (older than RETENTION_DAYS)
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null

# Count total backups
TOTAL_BACKUPS=$(find $BACKUP_DIR -type f -name "*.sql.gz" | wc -l)
echo "[$TIMESTAMP] Total backups retained: $TOTAL_BACKUPS"

echo "[$TIMESTAMP] ✅ Database backup completed"
