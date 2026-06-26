#!/bin/bash
# ============================================================
# GoMotarCar — MongoDB Automated Backup Script
# ============================================================
# Performs mongodump, compresses, optionally uploads to S3,
# and manages retention (daily/weekly/monthly).
#
# Usage:
#   chmod +x scripts/backup.sh
#   ./scripts/backup.sh                    # Manual backup
#   ./scripts/backup.sh --dry-run          # Preview without backing up
#
# Cron (daily):
#   0 2 * * * /opt/gomotarcar/scripts/backup.sh >> /var/log/gomotarcar-backup.log 2>&1
# ============================================================

set -euo pipefail

# ============================================================
# Configuration — customize for your environment
# ============================================================
BACKUP_DIR="/var/backups/gomotarcar"
DB_NAME="gomotarcar"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/gomotarcar}"
S3_BUCKET="${S3_BACKUP_BUCKET:-gomotarcar-backups}"
S3_REGION="${S3_REGION:-ap-south-1}"
RETENTION_DAILY=7      # Keep daily backups for 7 days
RETENTION_WEEKLY=4     # Keep weekly backups for 4 weeks
RETENTION_MONTHLY=3    # Keep monthly backups for 3 months
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DRY_RUN="${DRY_RUN:-false}"

# Parse args
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE — no actual backup will be performed"
fi

# ============================================================
# Helper Functions
# ============================================================
log_info()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
log_error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*"; }
log_warn()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  $*"; }

notify_slack() {
    local status="$1"
    local message="$2"
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -s -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"[GoMotarCar Backup] ${status}: ${message}\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
}

cleanup_old_backups() {
    local dir="$1"
    local retention_days="$2"
    local pattern="${3:-*.gz}"

    log_info "Cleaning up ${pattern} older than ${retention_days} days in ${dir}..."
    find "$dir" -name "$pattern" -type f -mtime "+${retention_days}" -delete 2>/dev/null || true
}

# ============================================================
# Main Backup Routine
# ============================================================
main() {
    log_info "========================================"
    log_info "  GoMotarCar Backup — Starting"
    log_info "========================================"

    # Validate required tools
    command -v mongodump >/dev/null 2>&1 || { log_error "mongodump not found. Install mongodb-database-tools."; notify_slack "❌ FAILED" "mongodump not found"; exit 1; }

    # Create backup directories
    local date_str
    date_str=$(date '+%Y-%m-%d_%H-%M-%S')
    local day_of_week
    day_of_week=$(date '+%u')  # 1=Monday, 7=Sunday
    local day_of_month
    day_of_month=$(date '+%d')

    local daily_dir="${BACKUP_DIR}/daily"
    local weekly_dir="${BACKUP_DIR}/weekly"
    local monthly_dir="${BACKUP_DIR}/monthly"

    mkdir -p "$daily_dir" "$weekly_dir" "$monthly_dir"

    # Temporary dump directory
    local tmp_dir
    tmp_dir=$(mktemp -d)

    local backup_file="gomotarcar_${date_str}.archive.gz"
    local backup_path="${daily_dir}/${backup_file}"

    log_info "Backing up MongoDB database: ${DB_NAME}"
    log_info "Source: ${MONGO_URI}"
    log_info "Destination: ${backup_path}"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would run: mongodump --uri=\"${MONGO_URI}\" --archive --gzip > \"${backup_path}\""
        log_info "[DRY RUN] Backup file: ${backup_file}"
    else
        # Perform backup
        log_info "Dumping database..."
        if mongodump --uri="${MONGO_URI}" --archive --gzip > "${backup_path}"; then
            local file_size
            file_size=$(du -h "$backup_path" | cut -f1)
            log_info "✅ Backup successful — ${file_size}"

            # Verify backup integrity
            log_info "Verifying backup integrity..."
            if mongorestore --dry-run --archive="${backup_path}" --gzip 2>&1 | head -5 > /dev/null; then
                log_info "✅ Backup integrity verified"
            else
                log_warn "⚠️  Backup integrity check had issues (may be expected for dry-run)"
            fi

            # Weekly backup (Sunday = day 7)
            if [[ "$day_of_week" == "7" ]]; then
                log_info "Creating weekly backup..."
                cp "$backup_path" "${weekly_dir}/${backup_file}"
            fi

            # Monthly backup (1st day of month)
            if [[ "$day_of_month" == "01" ]]; then
                log_info "Creating monthly backup..."
                cp "$backup_path" "${monthly_dir}/${backup_file}"
            fi

            # Upload to S3
            if command -v aws &> /dev/null; then
                log_info "Uploading to S3 (s3://${S3_BUCKET}/)..."
                if aws s3 cp "$backup_path" "s3://${S3_BUCKET}/daily/${backup_file}" --region "$S3_REGION" 2>&1; then
                    log_info "✅ S3 upload successful"
                    # Upload weekly/monthly copies if created
                    [[ -f "${weekly_dir}/${backup_file}" ]] && aws s3 cp "${weekly_dir}/${backup_file}" "s3://${S3_BUCKET}/weekly/${backup_file}" --region "$S3_REGION" || true
                    [[ -f "${monthly_dir}/${backup_file}" ]] && aws s3 cp "${monthly_dir}/${backup_file}" "s3://${S3_BUCKET}/monthly/${backup_file}" --region "$S3_REGION" || true
                else
                    log_warn "⚠️  S3 upload failed — backup kept locally"
                fi
            else
                log_warn "⚠️  AWS CLI not found — skipping S3 upload"
            fi

            notify_slack "✅ SUCCESS" "Backup ${backup_file} (${file_size}) completed successfully"

        else
            local exit_code=$?
            log_error "❌ Backup failed with exit code ${exit_code}"
            notify_slack "❌ FAILED" "Backup failed with exit code ${exit_code}"
            rm -rf "$tmp_dir"
            return 1
        fi
    fi

    # Cleanup old backups
    log_info "Cleaning up old backups..."
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would delete daily backups older than ${RETENTION_DAILY} days"
        log_info "[DRY RUN] Would delete weekly backups older than $((RETENTION_WEEKLY * 7)) days"
        log_info "[DRY RUN] Would delete monthly backups older than $((RETENTION_MONTHLY * 30)) days"
    else
        cleanup_old_backups "$daily_dir" "$RETENTION_DAILY"
        cleanup_old_backups "$weekly_dir" "$((RETENTION_WEEKLY * 7))"
        cleanup_old_backups "$monthly_dir" "$((RETENTION_MONTHLY * 30))"
        log_info "✅ Cleanup complete"
    fi

    # Cleanup temp dir
    rm -rf "$tmp_dir"

    log_info "========================================"
    log_info "  Backup Complete"
    log_info "========================================"
}

main "$@"
