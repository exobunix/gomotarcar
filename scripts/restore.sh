#!/bin/bash
# ============================================================
# GoMotarCar — MongoDB Restore Script
# ============================================================
# Restores a MongoDB database from a local or S3 backup file.
#
# Usage:
#   ./scripts/restore.sh --file /path/to/backup.gz        # Local file
#   ./scripts/restore.sh --s3 gomotarcar-backups/daily/... # S3 file
#   ./scripts/restore.sh --latest                          # Latest daily backup
#   ./scripts/restore.sh --dry-run --file backup.gz        # Preview only
#
# Safety:
#   - Requires --confirm flag to actually execute
#   - Creates a pre-restore snapshot (if enabled)
# ============================================================

set -euo pipefail

# ============================================================
# Configuration
# ============================================================
BACKUP_DIR="/var/backups/gomotarcar"
DB_NAME="gomotarcar"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/gomotarcar}"
S3_BUCKET="${S3_BACKUP_BUCKET:-gomotarcar-backups}"
S3_REGION="${S3_REGION:-ap-south-1}"
DRY_RUN=false
CONFIRMED=false
PRE_RESTORE_BACKUP=true

# ============================================================
# Helper Functions
# ============================================================
log_info()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*"; }
log_error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*"; }
log_warn()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  $*"; }

show_help() {
    cat << EOF
Usage: $0 [options]

Options:
  --file <path>     Restore from a local backup file (.gz)
  --s3 <path>       Restore from an S3 backup (s3://bucket/key)
  --latest          Restore from the latest daily backup
  --dry-run         Preview the restore without executing
  --confirm         Actually execute the restore (safety flag)
  --no-pre-backup   Skip pre-restore backup
  -h, --help        Show this help message

Examples:
  $0 --latest --dry-run
  $0 --file /var/backups/gomotarcar/daily/backup.gz --confirm
  $0 --s3 gomotarcar-backups/daily/backup.gz --confirm
EOF
    exit 0
}

# ============================================================
# Parse Arguments
# ============================================================
RESTORE_SOURCE=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --file)     RESTORE_SOURCE="local:$2"; shift 2 ;;
        --s3)       RESTORE_SOURCE="s3:$2"; shift 2 ;;
        --latest)   RESTORE_SOURCE="latest"; shift ;;
        --dry-run)  DRY_RUN=true; shift ;;
        --confirm)  CONFIRMED=true; shift ;;
        --no-pre-backup) PRE_RESTORE_BACKUP=false; shift ;;
        -h|--help)  show_help ;;
        *)          log_error "Unknown option: $1"; show_help ;;
    esac
done

# ============================================================
# Main Restore Logic
# ============================================================
main() {
    log_info "========================================"
    log_info "  GoMotarCar Database Restore"
    log_info "========================================"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "🔍 DRY RUN MODE — no changes will be made"
    fi

    # Validate restore source
    if [[ -z "$RESTORE_SOURCE" ]]; then
        log_error "No restore source specified. Use --file, --s3, or --latest"
        show_help
    fi

    local backup_file=""

    case "$RESTORE_SOURCE" in
        latest)
            log_info "Looking for latest backup in ${BACKUP_DIR}/daily/"
            backup_file=$(ls -t "${BACKUP_DIR}/daily"/gomotarcar_*.archive.gz 2>/dev/null | head -1)
            if [[ -z "$backup_file" ]]; then
                log_error "No backups found in ${BACKUP_DIR}/daily/"
                exit 1
            fi
            log_info "Found: ${backup_file}"
            ;;
        local:*)
            backup_file="${RESTORE_SOURCE#local:}"
            if [[ ! -f "$backup_file" ]]; then
                log_error "Backup file not found: ${backup_file}"
                exit 1
            fi
            ;;
        s3:*)
            backup_file="/tmp/gomotarcar-restore-$$.archive.gz"
            local s3_path="${RESTORE_SOURCE#s3:}"
            log_info "Downloading from S3: s3://${s3_path}"
            if [[ "$DRY_RUN" == "true" ]]; then
                log_info "[DRY RUN] Would download s3://${s3_path} to ${backup_file}"
            else
                aws s3 cp "s3://${s3_path}" "$backup_file" --region "$S3_REGION" || {
                    log_error "Failed to download from S3"
                    rm -f "$backup_file"
                    exit 1
                }
                log_info "✅ Downloaded successfully"
            fi
            ;;
    esac

    # Show restore plan
    echo ""
    log_info "Restore Plan:"
    log_info "  Source:      ${backup_file}"
    log_info "  Database:    ${DB_NAME}"
    log_info "  URI:         ${MONGO_URI}"
    log_info "  Pre-backup:  ${PRE_RESTORE_BACKUP}"
    echo ""

    # Require confirmation
    if [[ "$CONFIRMED" != "true" ]]; then
        log_warn "⚠️  Running in dry-run mode (use --confirm to actually restore)"
        log_info ""
        log_info "To execute this restore, run:"
        log_info "  $0 $([ -n "${RESTORE_SOURCE}" ] && echo "--${RESTORE_SOURCE%%:*} ${RESTORE_SOURCE#*:}") --confirm"
        DRY_RUN=true
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would restore from: ${backup_file}"
        log_info "[DRY RUN] Target database: ${DB_NAME}"
        log_info "[DRY RUN] Command: mongorestore --uri=\"${MONGO_URI}\" --archive=\"${backup_file}\" --gzip --drop"
        log_info ""
        log_info "✅ Dry run complete — no changes made"
        exit 0
    fi

    # Pre-restore backup
    if [[ "$PRE_RESTORE_BACKUP" == "true" ]]; then
        log_info "Creating pre-restore backup..."
        local pre_backup_file="${BACKUP_DIR}/pre-restore-$(date '+%Y-%m-%d_%H-%M-%S').archive.gz"
        mkdir -p "$BACKUP_DIR"
        if mongodump --uri="${MONGO_URI}" --archive --gzip > "$pre_backup_file"; then
            log_info "✅ Pre-restore backup saved: ${pre_backup_file}"
        else
            log_warn "⚠️  Pre-restore backup failed — continuing anyway"
        fi
    fi

    # Perform restore
    log_info "Restoring database..."
    log_info "This will DROP the existing database first (--drop flag)"
    echo ""
    read -rp "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
    if [[ "$confirmation" != "yes" ]]; then
        log_info "Restore cancelled."
        rm -f /tmp/gomotarcar-restore-*.archive.gz 2>/dev/null || true
        exit 0
    fi

    if mongorestore --uri="${MONGO_URI}" --archive="${backup_file}" --gzip --drop; then
        log_info "========================================"
        log_info "  ✅ RESTORE COMPLETE"
        log_info "========================================"
        log_info "  Source: ${backup_file}"
        log_info "  Database: ${DB_NAME}"
    else
        log_error "❌ Restore failed!"
        log_error "Pre-restore backup available at: ${pre_backup_file:-unknown}"
        exit 1
    fi

    # Cleanup temp file
    rm -f /tmp/gomotarcar-restore-*.archive.gz 2>/dev/null || true
}

main
