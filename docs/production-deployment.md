# MatMix production deployment and soft launch

## Configuration inventory

Production has no acceptable default for `SESSION_SECRET`, the five absolute runtime paths, `PUBLIC_BASE_URL`, `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY`, backup freshness/retention, disk threshold, login limits, document versions, seller identity, contacts, jurisdiction, retention and approved legal content. `SESSION_SECRET` is the only application secret in this list; keep it in a root-owned `0640` EnvironmentFile and never log it. Seller/contact/legal values and `PUBLIC_BASE_URL` are public. `PORT`, `SITE_NAME`, `DEFAULT_OG_IMAGE`, `SESSION_TTL_MS` and `SHUTDOWN_TIMEOUT_MS` have development defaults, but are explicit in production. Development may omit runtime paths and use repository-local files; production may not. See `deploy/matmix.env.example` and `docs/legal-readiness.md` for the complete legal-content set.

`NODE_ENV=production`, `PORT`, `SESSION_SECRET`, `SESSION_DB_PATH`, `MATMIX_DB_PATH`, `PRODUCT_UPLOADS_PATH`, `BACKUP_ROOT_PATH`, `BACKUP_RETENTION_COUNT`, `BACKUP_MAX_AGE_HOURS`, `APP_RUNTIME_LOCK_PATH`, `PUBLIC_BASE_URL`, `SEO_ALLOW_INDEXING`, `SITE_NAME`, `DEFAULT_OG_IMAGE`, `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY`, `LOGIN_RATE_WINDOW_MS`, `LOGIN_RATE_MAX`, `MIN_FREE_DISK_MB` and every variable required by `legal:check` are mandatory. Recommended: explicit `SESSION_TTL_MS`, `SHUTDOWN_TIMEOUT_MS`, scheduled backup and retention reports. Development-only: repository-local runtime defaults and ephemeral session secret.

The validator requires a 48-character secret, HTTPS canonical origin, one trusted reverse proxy, HTTPS CORS origins including the canonical origin, valid public phone/email, legal readiness, numeric limits, and absolute runtime paths outside `public` and `.git`. Startup runs it before opening the port. `production:check` additionally opens the DB read-only, checks schema/FK mode, uploads references, directory access, free space, and fully verifies the newest non-temporary backup and its age.

## Filesystem and service

Recommended layout: application code `/opt/matmix/app` (root-owned and read-only to the service), DB/session/uploads under `/var/lib/matmix`, backups under `/var/backups/matmix`, and optional exported logs under `/var/log/matmix`. Use a dedicated non-root `matmix` account, directories `0750`, files `0640`, `UMask=0027`, and no world-writable path. Nginx must not expose backups or DB files. Uploads continue through the Express filename/symlink allowlist rather than an Nginx alias.

The supplied Nginx example redirects HTTP to HTTPS, forwards Host and proxy headers, sets limits/timeouts, denies dotfiles and keeps API/HTML uncacheable. Replace `example.invalid`; validate with `nginx -t`. Use Certbot's Nginx/webroot flow or an approved external TLS terminator. Verify renewal and HTTP redirect. HSTS is emitted only on secure production requests and does not enable preload.

The systemd example uses the non-root account, a protected filesystem, private `/tmp`, journald, restart delay, `ExecStartPre=production:check` and a 40-second stop timeout. The application stops accepting connections, waits for active requests, closes session/business SQLite handles, removes its lock and forces a non-zero exit after `SHUTDOWN_TIMEOUT_MS`. Imports/uploads run inside active HTTP requests and are covered by server close; backup/restore/migrations remain stopped-service CLI operations.

## Release sequence and rollback

1. Select and record the release commit; require clean Git.
2. Run `npm ci` and `npm audit --omit=dev` in a build environment.
3. Populate the protected EnvironmentFile and run `npm run production:check` and `npm run release:check -- --with-e2e`.
4. Stop MatMix and confirm the runtime lock is absent.
5. Create and verify a full backup; confirm a separate encrypted off-host copy manually.
6. Run migration dry-run, review it, apply with the confirmation phrase, then run database health.
7. Start systemd, check `/health`, `/ready`, legal pages, robots/sitemap, login and a controlled test order.
8. Begin soft launch with indexing disabled and restricted audience. Observe for 24–48 hours, then intentionally enable indexing and rerun gates.

Rollback: stop the service; return to the previous immutable code release; restore the verified pre-migration backup only when schema/data rollback is required; run database health; start and repeat smoke tests. Never restore over a running process.

## Operations, logs and alerts

Production request logs are JSON and contain timestamp, request ID, method, path, status, duration and authenticated numeric user ID where available. They exclude body, cookies, authorization, customer address/comment, passwords, workbook and upload contents. Application lifecycle/readiness errors are structured. Use journald retention (`SystemMaxUse`/`MaxRetentionSec`) or an approved collector; do not duplicate unrestricted logs.

Alert on process crash/restart loops, sustained 5xx, readiness failure, SQLite busy/locked errors, backup age/failure, disk below `MIN_FREE_DISK_MB`, TLS renewal and systemd failures. Sentry, Better Stack or another collector may be added only with payload scrubbing and legal approval; journald plus infrastructure alerts is sufficient initially. The disk check is a threshold, not a guarantee against exhaustion.

Manual gates that automation cannot prove: real TLS/DNS, filesystem owner/mode, external encrypted backup, backup schedule, monitoring delivery, legal approval, operator rollback rehearsal, restricted-audience plan and treatment of test orders. Do not use an application-wide shared password. If staging access is needed, use reverse-proxy Basic Auth only on staging/limited soft launch, never as customer authentication.

`/health` is a minimal liveness response. `/ready` returns only `ready`/`not_ready`; it checks schema, DB/session access, legal configuration and backup age without running `integrity_check`. Detailed diagnostics are CLI-only.
