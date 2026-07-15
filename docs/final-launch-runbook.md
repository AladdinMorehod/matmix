# MatMix final production launch runbook

This runbook performs no DNS, certificate, legal or business decision automatically. Commands that mutate production data are explicitly marked. Record the release commit, operator, timestamps, backup paths, checksums and approvals in the change ticket.

## Production environment inventory

The source of truth is `backend/services/productionReadiness.js`, `backend/services/legal.js` and `deploy/matmix.env.example`. All rows are required in production unless marked recommended. Examples are deliberately non-real.

| Variable | Class | Format / example | Provider | Check |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | Public operations | exact `production` | Operations | `production:check` |
| `PORT` | Public operations | integer 1–65535, e.g. `3000` | Operations | `production:check` |
| `SESSION_SECRET` | **Secret** | at least 48 random characters; never reuse the example | Security/Operations | startup, `production:check` |
| `MATMIX_DB_PATH` | Runtime path | absolute, outside app/web root, e.g. `/var/lib/matmix/matmix.db` | Operations | `production:check` |
| `SESSION_DB_PATH` | Runtime path | absolute, e.g. `/var/lib/matmix/sessions.db`; do not migrate old sessions | Operations | `production:check` |
| `PRODUCT_UPLOADS_PATH` | Runtime path | absolute directory outside web root, e.g. `/var/lib/matmix/uploads/products` | Operations | `production:check` |
| `BACKUP_ROOT_PATH` | Runtime path | absolute, outside uploads/web root, e.g. `/var/backups/matmix` | Operations | `production:check`, backup verify |
| `APP_RUNTIME_LOCK_PATH` | Runtime path | absolute, e.g. `/var/lib/matmix/matmix-runtime.lock` | Operations | startup, migration/restore |
| `PUBLIC_BASE_URL` | Public | HTTPS origin only, no path, e.g. `https://shop.example.invalid` | Domain owner/Operations | legal and production checks, SEO tests |
| `SITE_NAME` | Public | non-empty display name, e.g. `MatMix` | Product owner | `production:check` |
| `DEFAULT_OG_IMAGE` | Public | safe site path, e.g. `/img/logo-burgundy.png` | Product owner | `production:check`, SEO smoke |
| `CORS_ALLOWED_ORIGINS` | Security | comma-separated HTTPS origins including `PUBLIC_BASE_URL` | Security/Operations | `production:check` |
| `TRUST_PROXY` | Security | exact `1` for the documented single Nginx proxy | Operations | startup, `production:check` |
| `LOGIN_RATE_WINDOW_MS` | Security | integer 1000–86400000, e.g. `900000` | Security owner | `production:check` |
| `LOGIN_RATE_MAX` | Security | integer 2–1000, e.g. `5` | Security owner | `production:check` |
| `BACKUP_RETENTION_COUNT` | Operations | integer 2–365, e.g. `14` | Data/Operations owner | `production:check` |
| `BACKUP_MAX_AGE_HOURS` | Operations | integer 1–720, e.g. `36` | Data/Operations owner | readiness and `production:check` |
| `MIN_FREE_DISK_MB` | Operations | integer >=128, recommended >=2048 | Operations | `production:check` |
| `SEO_ALLOW_INDEXING` | Public/launch | exact `false` for soft launch; `true` only at approved public launch | Product/SEO owner | production and SEO checks |
| `SESSION_TTL_MS` | Recommended security | positive milliseconds, e.g. `28800000` | Security owner | server parsing/manual review |
| `SHUTDOWN_TIMEOUT_MS` | Recommended operations | >=5000 ms, e.g. `30000` | Operations | lifecycle/CI |

Legal identity/contact values are public, required, and must be supplied by the owner and approved legal reviewer: `LEGAL_BUSINESS_NAME`, `LEGAL_ENTITY_FORM`, `LEGAL_REGISTRATION_ID`, `LEGAL_TAX_ID`, `LEGAL_ADDRESS`, `LEGAL_POSTAL_ADDRESS`, `PUBLIC_PHONE` (basic `+7 900 000-00-00` format), `PUBLIC_EMAIL` (valid email), `PUBLIC_WORKING_HOURS`, `LEGAL_JURISDICTION`, `LEGAL_PROCESSORS`, `LEGAL_EFFECTIVE_DATE`, `PRIVACY_POLICY_VERSION`, `TERMS_VERSION`. Retention values `CUSTOMER_DATA_RETENTION`, `ORDER_DATA_RETENTION`, `LOG_RETENTION`, `BACKUP_RETENTION` require Data/Legal approval. All are checked by `npm run legal:check` and `npm run production:check`; examples must remain placeholders until approved.

Approved commercial/legal content is also required from Product owner + Legal: `ORDER_CONFIRMATION_TERMS`, `DELIVERY_TERRITORY`, `DELIVERY_METHODS`, `PICKUP_TERMS`, `DELIVERY_COST_TERMS`, `DELIVERY_TIME_TERMS`, `DELIVERY_CHANGE_TERMS`, `UNLOADING_TERMS`, `OVERSIZE_TERMS`, `PAYMENT_METHODS_PUBLIC`, `PAYMENT_TIMING`, `PAYMENT_DOCUMENTS`, `CASHLESS_TERMS`, `REFUND_PROCESS`, `PUBLIC_CURRENCY`, `RETURN_CATEGORIES`, `RETURN_PERIOD_TERMS`, `RETURN_CONDITION`, `RETURN_REQUEST_PROCESS`, `RETURN_DOCUMENTS`, `RETURN_SHIPPING`, `RETURN_EXCEPTIONS`, `REFUND_TIME`, `LIABILITY_TERMS`, `FORCE_MAJEURE_TERMS`. Each must be non-empty, contain no bracket placeholder/DRAFT marker, and is verified by `legal:check`.

## A. Prepare the Linux server

```bash
sudo useradd --system --home /var/lib/matmix --shell /usr/sbin/nologin matmix
sudo install -d -o root -g matmix -m 0750 /opt/matmix/app
sudo install -d -o matmix -g matmix -m 0750 /var/lib/matmix /var/lib/matmix/uploads/products /var/backups/matmix /var/log/matmix
sudo install -d -o root -g matmix -m 0750 /etc/matmix
node --version
npm --version
```

Install the supported Node LTS used by CI (Node 22), place the immutable release at `/opt/matmix/app`, then verify `git rev-parse HEAD` and `git status --short`. Create `/etc/matmix/matmix.env` from `deploy/matmix.env.example`, replace every placeholder through the approved secret/configuration process, and set `root:matmix 0640`. Install the Nginx/systemd examples only after replacing `example.invalid`; run Certbot's documented Nginx/webroot flow or configure the approved external TLS terminator. Do not enable HSTS preload.

## B. Install and validate the application

```bash
cd /opt/matmix/app
npm ci
node --version
npm --version
npm run production:check
npm run legal:check -- --json
node --check backend/server.js
npm run test:database-integrity
npm run test:production-readiness
npm run test:lifecycle
```

`production:check` is expected to fail before the production DB and first verified backup exist. Record the expected failures; it must pass at Gate G. Run `npm audit --omit=dev --json` and attach the signed decision from `docs/dependency-security-review.md`.

## C. Transfer data (mutating production filesystem)

```bash
sudo systemctl stop matmix
sudo test ! -e /var/lib/matmix/matmix-runtime.lock
sudo install -o matmix -g matmix -m 0640 /secure-transfer/matmix.db /var/lib/matmix/matmix.db
sudo rsync -a --delete --chown=matmix:matmix /secure-transfer/uploads/products/ /var/lib/matmix/uploads/products/
sudo -u matmix test -r /var/lib/matmix/matmix.db
sudo -u matmix test -w /var/lib/matmix
sudo -u matmix test -r /var/lib/matmix/uploads/products
```

Do not transfer a session DB. Do not copy SQLite WAL/SHM files. The source application must be stopped and checkpointed before the main DB is transferred. Confirm product/order/client counts against the signed source inventory. Use `npm run database:health` only after migration; before migration record `PRAGMA user_version` through the approved SQLite inspection procedure.

## D. Full pre-migration backup

With the environment loaded for the `matmix` account and service stopped:

```bash
sudo -u matmix node backend/scripts/backup-production-data.js --dry-run
sudo -u matmix node backend/scripts/backup-production-data.js
sudo -u matmix node backend/scripts/backup-production-data.js --verify-only /var/backups/matmix/<recorded-backup-directory>
sha256sum /var/backups/matmix/<recorded-backup-directory>/manifest.json
```

`<recorded-backup-directory>` is the exact path printed by the preceding command, not a guessed name. Copy it to approved encrypted off-host storage, verify that copy independently, and record both locations and manifest checksum. This is a manual blocking gate.

## E. Migrate schema 0 to current

```bash
sudo -u matmix npm run database:migrate -- --dry-run
sudo -u matmix npm run database:migrate -- --apply --confirm MIGRATE_MATMIX_DATABASE
sudo -u matmix npm run database:health -- --json
```

Require schema version 2, `integrity=ok`, zero foreign-key violations, expected counts and no runtime lock. Stop on any discrepancy. Never rerun apply blindly after a partial operational failure; inspect its JSON and generated pre-migration backup first.

## F. Start application and proxy

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now matmix
sudo systemctl status matmix --no-pager
sudo journalctl -u matmix -n 200 --no-pager
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/ready
sudo nginx -t
sudo systemctl reload nginx
curl --fail --head https://example.invalid/health
curl --fail --head https://example.invalid/
```

Replace `example.invalid` with the approved hostname. Confirm HTTP redirects to HTTPS, secure session cookie behind Nginx, HSTS without preload, no mixed content, correct proxy IP/protocol and no public access to DB/backups/dotfiles.

## G. Release gates

```bash
npm run production:check
npm run release:check
npm run release:check -- --with-e2e
```

All must exit 0. Attach legal approval, off-host backup verification, monitoring delivery test, filesystem permissions, TLS/DNS evidence and dependency risk acceptance. The browser E2E server uses isolated fixtures; additionally perform the production smoke below.

## H. Soft launch

Keep `SEO_ALLOW_INDEXING=false`. Restrict only the agreed staging/soft-launch audience at the reverse proxy; never add a shared password to MatMix. Execute the smoke checklist, marking test orders clearly in the comment according to the approved procedure. Observe for 24–48 hours, verify the scheduled backup after day one, review orders, errors, disk and readiness, and hold a go/no-go review.

## I. Public launch

Repeat Gates D–G and the smoke checklist. Obtain the explicit SEO decision, set `SEO_ALLOW_INDEXING=true`, restart MatMix, verify `/robots.txt`, `/sitemap.xml`, HTTPS canonicals and legal pages, then remove the temporary proxy restriction. Place one approved marked order and observe dashboards/journald closely for the first hours.

## J. Rollback

Rollback on failed migration/health, repeated 5xx/readiness failures, corrupt or missing data/uploads, security regression or unbounded operational errors. Record the incident and stop traffic/service:

```bash
sudo systemctl stop matmix
sudo test ! -e /var/lib/matmix/matmix-runtime.lock
```

Switch `/opt/matmix/app` to the recorded previous immutable release. Restore DB/uploads only if the migration or production writes require data rollback; a code-only failure does not justify DB restore. First run:

```bash
sudo -u matmix node backend/scripts/restore-production-data.js /var/backups/matmix/<verified-backup> --dry-run
sudo -u matmix node backend/scripts/restore-production-data.js /var/backups/matmix/<verified-backup> --apply --confirm RESTORE_MATMIX_DATA
sudo systemctl start matmix
curl --fail --silent --show-error http://127.0.0.1:3000/health
curl --fail --silent --show-error http://127.0.0.1:3000/ready
sudo -u matmix npm run database:health -- --json
```

The restored standalone backup initially uses SQLite `journal_mode=delete`; this is expected for the verified `VACUUM INTO` artifact. The first normal application connection returns the live database to WAL, so the order above is intentional. Stop the service and investigate if either endpoint or the subsequent health check fails. Repeat HTTPS/order/CRM smoke and preserve incident notes. Restore never runs against a live service.

## Production smoke checklist

Verify: home/header/hero/footer; catalog hierarchy and pagination; direct category/subcategory/product routes; search (`ГКЛ`, `ГКЛВ`, `Ротбанд`, MAT code, no-result/malicious query); images and missing-image state; cart quantity/removal/reload; consent links and blocked unchecked submit; one approved marked test order; server-calculated total; CRM login and appearance of consent metadata; import **preview only**; Excel export; backup create+verify; logout/back; 404; robots, sitemap, canonical; `/health` and `/ready`.

Order creation, import apply, product/image edits and backup/restore mutate data. During smoke, do not run import apply or destructive image operations. Mark the test order with the approved identifier. Do not delete it directly; close/anonymize/remove it only through the owner-approved retention/accounting procedure.

## Soft-launch monitoring

| Signal | Initial threshold | Action |
| --- | --- | --- |
| `/health`, `/ready` | 2 consecutive failures / 2 min | Stop traffic escalation; inspect systemd, DB, backup/legal readiness |
| Process restarts | >2 in 15 min | Roll back or disable traffic; inspect crash logs |
| HTTP 5xx | >1% for 5 min or any sustained order 5xx | Page operator; preserve request IDs; consider rollback |
| Login rate limits | >20/hour or sharp source spike | Review proxy/source IP, do not weaken limits automatically |
| `SQLITE_BUSY/LOCKED` | >3 in 5 min | Stop write-heavy operations; inspect concurrency/disk |
| API latency | p95 >1 s for 10 min | Inspect DB, disk, proxy and largest endpoints |
| Order failures | any repeated failure or >1% | Pause public traffic; verify DB/catalog calculation |
| Backup age | >`BACKUP_MAX_AGE_HOURS` | Blocking alert; create and verify backup |
| Backup verify | any failure | Treat backup as unusable; create a new verified copy |
| Free disk | below `MIN_FREE_DISK_MB` or <15% | Stop imports/uploads/backups; expand/clean by approved policy |
| Upload/image failure | 3 in 15 min | Pause image changes; inspect size/type/disk |
| Image queue | no explicit queue metric exists | Monitor active upload duration/errors; do not claim queue telemetry |
| Schema version | not 2 | Readiness failure; stop deployment |
| TLS expiry | <21 days warning, <7 days critical | Renew and verify chain/redirect |

## Manual launch gates

| Gate | Owner | Type | Current status | Evidence | Blocking / action |
| --- | --- | --- | --- | --- | --- |
| Production env | Operations/Security | Automated + manual | Missing | `production:check` exit 2 | Blocking: populate protected env |
| Legal approval | Owner + Legal | Manual | Placeholders/DRAFT | `legal:check` exit 2 | Blocking: approve actual texts/versions |
| HTTPS and DNS | Operations | Manual | Not tested externally | Nginx/TLS curl evidence absent | Blocking |
| External encrypted backup | Data owner | Manual | Unconfirmed | Off-host checksum absent | Blocking |
| Restore rehearsal | Operations | Automated fixture; manual production-like | Fixture passed | `test-backup-restore` | Repeat on deployment copy |
| Migration | DBA/Operations | Automated + manual | Working source schema 0 | migration rehearsal | Apply only after verified backup |
| Release check | Release manager | Automated | Real config exit 2 | CLI JSON | Blocking until exit 0 |
| Dependency risk | Security owner | Manual | 9 advisories open | dependency review | High chain needs signed acceptance or fix |
| Monitoring delivery | Operations | Manual | Unconfirmed | test alert absent | Blocking |
| Disk alerts | Operations | Automated check + manual alert | Threshold implemented, alert absent | `MIN_FREE_DISK_MB` | Configure delivery |
| SMTP/notifications | Product/Operations | Manual | No SMTP integration found | code inventory | Not applicable unless business adds it |
| Browser smoke | QA | Automated + manual | Chromium fixture passed | Playwright output | Repeat against HTTPS production |
| Real test order | Product/QA | Manual/data-changing | Not performed | approved order ID absent | Required before public launch |
| SEO indexing | Product/SEO | Manual | Undecided | `SEO_ALLOW_INDEXING` | Keep false for soft launch |
| 24–48 h observation | Release manager | Manual | Not started | observation record absent | Blocking before public launch |
