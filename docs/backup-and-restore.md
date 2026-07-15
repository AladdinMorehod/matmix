# MatMix backup and restore

The production backup contains a consistent SQLite copy of the main database and every regular file from the physical product uploads directory. It does not contain sessions, cookies, `.env`, secrets, logs, imported workbooks, old backups, `node_modules`, Git metadata, or deployment files. Templates and application code are restored from Git/deployment.

## Runtime configuration

- `MATMIX_DB_PATH`: main SQLite database.
- `SESSION_DB_PATH`: session database; deliberately excluded from disaster-recovery backups.
- `PRODUCT_UPLOADS_PATH`: physical product-image directory mounted publicly as `/uploads/products`.
- `BACKUP_ROOT_PATH`: destination for completed backup directories.
- `BACKUP_RETENTION_COUNT`: number of successful `matmix-backup-*` directories retained; default 14.
- `APP_RUNTIME_LOCK_PATH`: application lock checked by restore.

Use absolute paths outside the deployment and web root in production. Do not put `BACKUP_ROOT_PATH` inside uploads. The application creates the runtime lock while running; restore requires the application to be stopped and the lock absent.

## Commands

```sh
node backend/scripts/backup-production-data.js --dry-run
node backend/scripts/backup-production-data.js
node backend/scripts/backup-production-data.js --verify-only /path/to/matmix-backup-YYYY-MM-DD-HH-mm-ss
node backend/scripts/restore-production-data.js /path/to/backup --dry-run
node backend/scripts/restore-production-data.js /path/to/backup --apply --confirm RESTORE_MATMIX_DATA
```

Backup uses SQLite `VACUUM INTO`, checks `integrity_check` and `foreign_key_check`, hashes the DB and every upload with SHA-256, writes `manifest.json`, verifies the complete temporary directory, and atomically renames it into place. Restore verifies everything before touching runtime data, creates a full `pre-restore-*` emergency backup, stages DB/uploads, swaps both, and rolls back both if a later step fails. Restore reports are written under the backup root.

Missing images referenced by active products are reported because existing data may intentionally use placeholders; they do not block backup. Unsafe references, orphan files, and shared references are listed in verification output.

## Scheduling and retention

Example cron (environment should be supplied securely by the service configuration):

```cron
15 2 * * * cd /opt/matmix/app && /usr/bin/node backend/scripts/backup-production-data.js
```

A systemd timer can run the same command daily with `WorkingDirectory` and environment supplied by an `EnvironmentFile` readable only by the service account. Recommended policy: 14 daily, 8 weekly, and 6 monthly copies. The built-in policy retains daily copies by count; weekly/monthly tiers should be implemented by the infrastructure backup system.

Backups on the same disk are not sufficient protection. Keep at least one verified copy on another server, external media, or object storage. Encrypt off-site backups using production infrastructure or a reviewed external tool; this project does not implement custom cryptography.

Regularly run `--verify-only` and perform a full restore rehearsal to isolated paths. After an incident: stop MatMix, confirm the runtime lock is absent, verify the selected backup, run restore dry-run, apply with the confirmation phrase, inspect the restore report, start the application, and verify API/catalog/orders/images. Monitor the timestamp and exit status of the most recent successful backup.
