# SQLite in production

MatMix uses schema version `2` (`PRAGMA user_version`). Version 2 adds versioned order-consent metadata; production startup refuses any other version, and migrations are deliberately separate from startup.

Before deployment, stop the application and run `npm run database:migrate -- --dry-run`. Review the orphan report, then run `npm run database:migrate -- --apply --confirm MIGRATE_MATMIX_DATABASE`. Apply refuses to run while the runtime lock exists and creates a consistent `VACUUM INTO` database backup before `BEGIN IMMEDIATE`. A failed migration rolls back; keep the application stopped, inspect the error and restore the generated backup if required.

Every writable business connection enables `foreign_keys=ON`, `journal_mode=WAL`, `synchronous=NORMAL` and a 5000 ms busy timeout. Read-only backup verification does not change journal mode. WAL improves reader/writer concurrency but does not eliminate writer contention; exhausted waits are returned by the API as controlled `503 DATABASE_BUSY`, while constraints become `409 DATABASE_CONFLICT`.

Run `npm run database:health -- --json` after migration and before startup. It checks the schema version, integrity, foreign keys, required indexes, orphan and duplicate counts, entity totals, and image-reference totals without printing personal data. Backup, verification and restore procedures remain those in `docs/backup-restore.md`; restore must be performed with MatMix stopped, followed by the health check.

Version 1 adds `orders.client_id -> clients.id ON DELETE SET NULL` so client removal cannot erase order history, and `order_events.order_id -> orders.id ON DELETE CASCADE` because events are technical children. `catalog_structure.parent_id` retains its restrictive default. Product names and `items_json` are historical snapshots and intentionally have no foreign keys.
