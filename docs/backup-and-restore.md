# MatMix backup and restore

Backup format v3 contains a consistent SQLite copy of the main database, every regular file from the physical product uploads directory, every private order attachment referenced by the SQLite snapshot, and every finalized catalog-import workbook from persistent storage. It does not contain sessions, cookies, `.env`, secrets, logs, temporary/incomplete import files, old backups, `node_modules`, Git metadata, or deployment files. Templates and application code are restored from Git/deployment.

The backup layout is:

```text
database/matmix.db
uploads/products/...
attachments/orders/<storageKey>
catalog-imports/catalog-import-<timestamp>-<random>.xlsx
manifest.json
```

The attachment manifest contains only the opaque storage key, relative backup path, byte size, and SHA-256. Original filenames, attachment contents, and absolute runtime paths are never written to logs or the manifest.

## Runtime configuration

- `MATMIX_DB_PATH`: main SQLite database.
- `SESSION_DB_PATH`: session database; deliberately excluded from disaster-recovery backups.
- `PRODUCT_UPLOADS_PATH`: physical product-image directory mounted publicly as `/uploads/products`.
- `ORDER_ATTACHMENTS_PATH`: private physical order-attachment directory. It must be an absolute path outside the deployed application, public root, Git metadata, operating-system temporary directory, product uploads, and backup root.
- `CATALOG_IMPORT_ARCHIVE_PATH`: persistent private catalog-import archive outside the deployed release, public root, Git metadata, operating-system temporary directory, uploads, attachments, and backup root. Production uses `/var/lib/matmix/catalog-imports`.
- `BACKUP_ROOT_PATH`: destination for completed backup directories.
- `BACKUP_RETENTION_COUNT`: number of successful `matmix-backup-*` directories retained; default 14.
- `APP_RUNTIME_LOCK_PATH`: application lock checked by restore.

Use absolute paths outside the deployment and web root in production. Product uploads, private attachments, catalog-import archives, and backups must not contain one another. The application creates the runtime lock while running; restore requires the application to be stopped and the lock absent.

Create the private attachment directory for the MatMix runtime user with directory mode `0700` and file mode `0600` (or an equivalently restrictive reviewed policy). The runtime user needs read/write access; the reverse proxy and public web user do not. A SQLite `ON DELETE CASCADE` removes attachment metadata only—it does not remove the physical file—so lifecycle code or a separately reviewed orphan-cleanup procedure must handle physical deletion.

## Commands

```sh
node backend/scripts/backup-production-data.js --dry-run
node backend/scripts/backup-production-data.js
node backend/scripts/backup-production-data.js --verify-only /path/to/matmix-backup-YYYY-MM-DD-HH-mm-ss
node backend/scripts/restore-production-data.js /path/to/backup --dry-run
node backend/scripts/restore-production-data.js /path/to/backup --apply --confirm RESTORE_MATMIX_DATA
npm run attachments:audit -- --check
npm run backup:rehearse-offsite -- --local-source /path/to/copied-backup
```

Backup uses SQLite `VACUUM INTO`, reads attachment metadata from that snapshot, safely opens each attachment without following symbolic links, and checks its size and SHA-256 while copying. It hashes the DB, every upload, every attachment, and every finalized catalog-import workbook, writes their sizes and SHA-256 values to `manifest.json`, verifies the complete temporary directory, and atomically renames that directory into place. A failed or incomplete backup never enters retention. In-progress catalog-import temp files are ignored.

Format-v3 restore verifies everything before touching runtime data, creates a full `pre-restore-*` emergency backup, stages DB/uploads/attachments/catalog-import archives, verifies the staged catalog-import file set, sizes and SHA-256 values, and then swaps all four resources. The active catalog-import archive is verified again after its swap while rollback sources still exist. The mandatory restore report is then written; only after it succeeds is the restore committed. A handled pre-commit error attempts compensating rollback of every swapped resource independently. Cleanup of `.old` paths happens after the commit boundary and can only produce warnings; it never removes active restored data.

SQLite plus three filesystem trees cannot be switched in one operating-system transaction. A machine failure between rename operations can therefore leave `.restore-*.old` and `.restore-*.tmp` recovery artifacts. Keep the application stopped, preserve those artifacts, and inspect the database, uploads, attachments, and catalog-import archive as one set before retrying. Do not delete them blindly.

Missing images referenced by active products are reported because existing data may intentionally use placeholders; they do not block backup. Unsafe references, orphan files, and shared references are listed in verification output.

Attachment audit is deliberately strict and read-only:

- missing files, size/SHA mismatches, unsafe entries, symbolic links, non-regular entries, and orphan files make the audit fail;
- orphan files are never deleted automatically;
- backup, production readiness, and release validation require a healthy audit;
- cleanup requires a separate reviewed operational procedure.

Legacy format v1 backups remain verifiable and restorable only when their SQLite snapshot has no `order_attachments` rows. A v1 backup containing attachment metadata is rejected because it cannot contain the corresponding private files. Format v1 and v2 do not contain catalog-import archives: restoring either format leaves the current `CATALOG_IMPORT_ARCHIVE_PATH` byte-for-byte unchanged and reports `catalogImportsRestored: false`. No empty replacement archive or placeholder is created. Format v3 restores the archived workbooks and reports `catalogImportsRestored: true`.

## Scheduling and retention

Example cron (environment should be supplied securely by the service configuration):

```cron
15 2 * * * cd /opt/matmix/app && /usr/bin/node backend/scripts/backup-production-data.js
```

The canonical `deploy/systemd/matmix-backup.service` and `matmix-backup.timer` run the command as `matmix`, load `/etc/matmix/matmix.env`, read `/var/lib/matmix` (including catalog imports), write only `/var/backups/matmix`, and keep the release tree read-only. Recommended policy: 14 daily, 8 weekly, and 6 monthly copies. The built-in policy retains daily copies by count; weekly/monthly tiers should be implemented by the infrastructure backup system.

Backups on the same disk are not sufficient protection. Keep at least one verified copy on another server, external media, or object storage. Encrypt off-site backups using production infrastructure or a reviewed external tool; this project does not implement custom cryptography.

Regularly run `--verify-only`, `npm run attachments:audit -- --check`, and a full restore rehearsal to isolated paths. The off-site rehearsal restores attachments and catalog-import workbooks alongside the database and uploads, then compares the complete archive file set, sizes, and SHA-256 values. After an incident: stop MatMix, confirm the runtime lock is absent, verify the selected backup, run restore dry-run, apply with the confirmation phrase, inspect the restore report, run the attachment audit, start the application, and verify API/catalog/orders/images/attachment and catalog-import downloads. Monitor the timestamp and exit status of the most recent successful backup.

For the download check, authenticate in CRM as an authorized manager or administrator, open a restored file request, confirm its attachment metadata, download each representative format, and compare the bytes or SHA-256 with the backup manifest. Never expose `attachments/orders` through static hosting.

## Release backup and rollback

The release script prepares the new immutable release before stopping the service, then creates the pre-migration backup with that **new release's** format-v3 implementation. This is required because an older active release may not know about private attachments or persistent catalog-import archives. Format v3 safely represents a schema-v2 database without `order_attachments` as an empty attachment set while still preserving catalog-import workbooks.

Record the exact `ROLLBACK_RELEASE` and `ROLLBACK_BACKUP` printed by deployment. Do not infer the backup from directory ordering or a wildcard. Once migration has started, rollback must restore the exact verified backup's database, product uploads, order attachments, and catalog-import archive before switching back to the recorded previous release:

```sh
sudo /opt/matmix/app/deploy/scripts/rollback-release.sh \
  /opt/matmix/releases/<recorded-previous-release> \
  /var/backups/matmix/<recorded-pre-deployment-backup>
```

The rollback script verifies the selected backup with the current release, stops the service, performs restore dry-run and confirmed apply through the current release, checks the restored schema with the recorded previous release, switches the symlink, starts the previous release and performs HTTP smoke checks. If restore dry-run fails, data is untouched and the current service can restart. If apply-restore fails, the service remains stopped for manual recovery; the script never silently chooses a different backup.

For a manual recovery, use the same exact backup path with `restore-production-data.js`, keep the service stopped through restore verification and attachment audit, then run database health from the recorded previous release so the expected schema matches the backup. Only then switch the symlink and start the previous release. After startup, repeat public home/catalog health checks and an authorized CRM download of representative restored attachments.
