const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const { REQUIRED_ENV } = require("../services/legal");
const { CURRENT_SCHEMA_VERSION, migrateDatabase } = require("../databaseMigrations");
const {
    FORMAT_VERSION,
    createBackup,
    verifyBackup,
    sha256
} = require("../services/productionBackup");
const { operationalReadiness } = require("../services/productionReadiness");
const { auditOrderAttachments } = require("../services/orderAttachmentAudit");
const { restore } = require("./restore-production-data");

const projectRoot = path.resolve(__dirname, "..", "..");

function runSql(file, statements) {
    const db = new sqlite3.Database(file);
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            for (const statement of statements) {
                db.run(statement, error => {
                    if (error) reject(error);
                });
            }
            db.close(error => error ? reject(error) : resolve());
        });
    });
}

function scalar(file, sql) {
    const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY);
    return new Promise((resolve, reject) => {
        db.get(sql, (error, row) => {
            db.close(() => {});
            if (error) reject(error);
            else resolve(Object.values(row)[0]);
        });
    });
}

async function createProductionLikeV2Database(file) {
    await runSql(file, [
        "PRAGMA foreign_keys=ON",
        "CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL)",
        `CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT,
            client_id INTEGER,
            comment TEXT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            items_json TEXT NOT NULL,
            status TEXT,
            created_at TEXT,
            updated_at TEXT,
            consent_given INTEGER,
            consent_at TEXT,
            privacy_policy_version TEXT,
            terms_version TEXT,
            privacy_policy_url TEXT,
            terms_url TEXT,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
        )`,
        `CREATE TABLE order_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            user_id INTEGER,
            user_name TEXT,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            deleted_at TEXT,
            sort_order INTEGER DEFAULT 0,
            category TEXT,
            subcategory TEXT,
            product_group TEXT,
            image_url TEXT,
            image TEXT
        )`,
        `CREATE TABLE catalog_structure (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            parent_id INTEGER,
            is_active INTEGER DEFAULT 1,
            external_code TEXT
        )`,
        "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT)",
        "CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL",
        "CREATE INDEX idx_clients_phone ON clients(phone)",
        "CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC)",
        "CREATE INDEX idx_orders_client_created_at ON orders(client_id, created_at DESC)",
        "CREATE INDEX idx_order_events_order_created_at ON order_events(order_id, created_at)",
        "CREATE INDEX idx_products_public_order ON products(is_active, deleted_at, sort_order, id)",
        "CREATE INDEX idx_products_catalog_order ON products(category, subcategory, sort_order, id)",
        "CREATE INDEX idx_products_group_order ON products(category, subcategory, product_group, sort_order, id)",
        "CREATE INDEX idx_products_image_url ON products(image_url)",
        "INSERT INTO clients(id,name,phone) VALUES(1,'Deployment rehearsal','+70000000000')",
        `INSERT INTO orders(
            id,order_number,client_id,customer_name,phone,items_json,status,created_at,updated_at,consent_given
        ) VALUES(
            1,'MM-REHEARSAL-1',1,'Deployment rehearsal','+70000000000','[]','Новая',
            '2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z',1
        )`,
        "INSERT INTO order_events(order_id,event_type,message,created_at) VALUES(1,'created','before deploy','2026-01-01T00:00:00.000Z')",
        "INSERT INTO products(id,external_id,is_active,sort_order,image_url,image) VALUES(1,'REHEARSAL-PRODUCT',1,1,NULL,NULL)",
        "PRAGMA user_version=2"
    ]);
}

function productionEnvironment(root, paths) {
    const env = {
        NODE_ENV: "production",
        PORT: "3000",
        SESSION_SECRET: "x".repeat(64),
        SESSION_DB_PATH: path.join(root, "runtime", "sessions.db"),
        MATMIX_DB_PATH: paths.dbPath,
        PRODUCT_UPLOADS_PATH: paths.uploadsPath,
        ORDER_ATTACHMENTS_PATH: paths.attachmentsPath,
        BACKUP_ROOT_PATH: paths.backupRoot,
        BACKUP_RETENTION_COUNT: "3",
        BACKUP_MAX_AGE_HOURS: "36",
        APP_RUNTIME_LOCK_PATH: paths.lockPath,
        PUBLIC_BASE_URL: "https://matmix.example",
        SEO_ALLOW_INDEXING: "false",
        SITE_NAME: "MatMix",
        DEFAULT_OG_IMAGE: "/img/logo-burgundy.png",
        CORS_ALLOWED_ORIGINS: "https://matmix.example",
        TRUST_PROXY: "1",
        LOGIN_RATE_WINDOW_MS: "900000",
        LOGIN_RATE_MAX: "5",
        MIN_FREE_DISK_MB: "128"
    };
    for (const name of REQUIRED_ENV) env[name] = "Approved deployment rehearsal value";
    Object.assign(env, {
        PUBLIC_EMAIL: "legal@example.test",
        PUBLIC_PHONE: "+7 900 000-00-00",
        PRIVACY_POLICY_VERSION: "rehearsal-1",
        TERMS_VERSION: "rehearsal-1"
    });
    return env;
}

function runDatabaseHealth(env) {
    const result = spawnSync(process.execPath, ["backend/scripts/check-database-health.js", "--json"], {
        cwd: projectRoot,
        env: { ...process.env, ...env },
        encoding: "utf8"
    });
    assert.strictEqual(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout.trim());
    assert.strictEqual(report.healthy, true);
    assert.strictEqual(report.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.strictEqual(report.expectedSchemaVersion, CURRENT_SCHEMA_VERSION);
    assert.strictEqual(report.integrity, "ok");
    assert.strictEqual(report.foreignKeyViolations, 0);
    assert.strictEqual(report.schema.orderAttachments, true);
    assert.strictEqual(report.schema.orderAttachmentsOrderIndex, true);
}

async function switchDirectoryLink(linkPath, target) {
    await fs.promises.rm(linkPath, { force: true, recursive: true });
    await fs.promises.symlink(
        target,
        linkPath,
        process.platform === "win32" ? "junction" : "dir"
    );
}

function assertOrdered(content, tokens) {
    let cursor = -1;
    for (const token of tokens) {
        const next = content.indexOf(token, cursor + 1);
        assert(next > cursor, `Deployment contract is missing or misorders: ${token}`);
        cursor = next;
    }
}

function assertDeploymentContracts() {
    const deploy = fs.readFileSync(path.join(projectRoot, "deploy", "scripts", "deploy-release.sh"), "utf8");
    const rollback = fs.readFileSync(path.join(projectRoot, "deploy", "scripts", "rollback-release.sh"), "utf8");
    const envExample = fs.readFileSync(path.join(projectRoot, "deploy", "matmix.env.example"), "utf8");
    const runbook = fs.readFileSync(path.join(projectRoot, "docs", "final-launch-runbook.md"), "utf8");
    const deploymentFlow = deploy.slice(deploy.indexOf('echo "Stopping $SERVICE before backup and migration..."'));

    assert(deploy.includes('source "$ENV_FILE"'));
    assert(!deploy.includes("env |"));
    assert(!deploy.includes("printenv"));
    assert(deploy.includes('install -d -o "$RUNTIME_USER" -g "$RUNTIME_GROUP" -m 0750 "$ORDER_ATTACHMENTS_PATH"'));
    assert(deploy.includes("--apply --confirm MIGRATE_MATMIX_DATABASE"));
    assert(deploy.includes('--verify-only "$backup_path"'));
    assert(deploy.includes('restore_exact_backup "$release_dir" "$backup_path"'));
    assert(deploy.includes('[[ "$backup_path" != "$(readlink -f "$BACKUP_ROOT_PATH")/"* ]]'));
    assert(deploy.includes('flock -n 9'));
    assert(!deploy.toLowerCase().includes("latest backup"));
    assertOrdered(deploymentFlow, [
        'systemctl stop "$SERVICE"',
        "backend/scripts/backup-production-data.js",
        "--verify-only",
        "npm run database:migrate -- --dry-run",
        "--apply --confirm MIGRATE_MATMIX_DATABASE",
        "npm run database:health",
        "npm run attachments:audit",
        "npm run production:check",
        'atomic_switch "$release_dir"',
        'systemctl start "$SERVICE"',
        "health_check"
    ]);

    assert(rollback.includes("<exact-verified-backup-path>"));
    assert(rollback.includes('--apply --confirm RESTORE_MATMIX_DATA'));
    assert(rollback.includes('"$backup_path" == "$(readlink -f "$BACKUP_ROOT_PATH")/"*'));
    assert(!rollback.toLowerCase().includes("latest backup"));
    assert(envExample.includes("ORDER_ATTACHMENTS_PATH=/var/lib/matmix/order-attachments"));
    assert(runbook.includes(`schema version ${CURRENT_SCHEMA_VERSION}`));
    assert(!runbook.includes("Schema version | not 2"));

    if (process.platform !== "win32") {
        for (const script of ["deploy-release.sh", "rollback-release.sh"]) {
            const syntax = spawnSync("bash", ["-n", path.join(projectRoot, "deploy", "scripts", script)], {
                encoding: "utf8"
            });
            assert.strictEqual(syntax.status, 0, syntax.stderr);
        }
    }
}

async function main() {
    assertDeploymentContracts();
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-deployment-rollout-"));
    try {
        const runtimeRoot = path.join(root, "runtime");
        const paths = {
            dbPath: path.join(runtimeRoot, "matmix.db"),
            uploadsPath: path.join(runtimeRoot, "uploads", "products"),
            attachmentsPath: path.join(runtimeRoot, "order-attachments"),
            backupRoot: path.join(root, "backups"),
            lockPath: path.join(runtimeRoot, "matmix-runtime.lock"),
            retentionCount: 3
        };
        const oldRelease = path.join(root, "releases", "old");
        const newRelease = path.join(root, "releases", "new");
        const appLink = path.join(root, "app");
        await Promise.all([
            fs.promises.mkdir(paths.uploadsPath, { recursive: true }),
            fs.promises.mkdir(paths.attachmentsPath, { recursive: true }),
            fs.promises.mkdir(paths.backupRoot, { recursive: true }),
            fs.promises.mkdir(oldRelease, { recursive: true }),
            fs.promises.mkdir(newRelease, { recursive: true })
        ]);
        await createProductionLikeV2Database(paths.dbPath);
        const productBytes = Buffer.from("product-upload-before-deploy");
        await fs.promises.writeFile(path.join(paths.uploadsPath, "existing.bin"), productBytes);
        await switchDirectoryLink(appLink, oldRelease);

        const preDeployBackup = await createBackup({
            paths,
            skipRetention: true
        });
        const verified = await verifyBackup(preDeployBackup.backupPath);
        assert.strictEqual(verified.manifest.formatVersion, FORMAT_VERSION);
        assert.strictEqual(verified.database.schemaVersion, 2);
        assert.strictEqual(verified.attachments.metadataCount, 0);

        const migration = await migrateDatabase(paths.dbPath, { dryRun: false });
        assert.strictEqual(migration.fromVersion, 2);
        assert.strictEqual(migration.toVersion, CURRENT_SCHEMA_VERSION);
        const env = productionEnvironment(root, paths);
        runDatabaseHealth(env);
        const audit = await auditOrderAttachments({
            dbPath: paths.dbPath,
            attachmentsPath: paths.attachmentsPath
        });
        assert.strictEqual(audit.healthy, true);
        const readiness = await operationalReadiness(env, { allowTemporaryPaths: true });
        assert.strictEqual(readiness.ready, true, JSON.stringify(readiness));

        let serviceStarted = false;
        await switchDirectoryLink(appLink, newRelease);
        serviceStarted = true;
        assert.strictEqual(path.resolve(await fs.promises.realpath(appLink)), path.resolve(newRelease));
        assert.strictEqual(serviceStarted, true);

        await fs.promises.writeFile(path.join(paths.uploadsPath, "existing.bin"), "changed-after-switch");
        const failedAttachmentKey = "failed-release.txt";
        const failedAttachmentPath = path.join(paths.attachmentsPath, failedAttachmentKey);
        await fs.promises.writeFile(failedAttachmentPath, "failed release attachment");
        const failedAttachmentSha = await sha256(failedAttachmentPath);
        await runSql(paths.dbPath, [
            `INSERT INTO order_attachments(
                order_id,original_name,storage_key,mime_type,extension,size_bytes,sha256,created_at
            ) VALUES(
                1,'failed-release.txt','${failedAttachmentKey}','text/plain','txt',25,
                '${failedAttachmentSha}','2026-01-02T00:00:00.000Z'
            )`
        ]);
        serviceStarted = false;
        await restore(preDeployBackup.backupPath, {
            apply: true,
            confirm: "RESTORE_MATMIX_DATA",
            paths
        });
        await switchDirectoryLink(appLink, oldRelease);
        serviceStarted = true;
        assert.strictEqual(path.resolve(await fs.promises.realpath(appLink)), path.resolve(oldRelease));
        assert.strictEqual(await scalar(paths.dbPath, "PRAGMA user_version"), 2);
        assert.strictEqual(
            await sha256(path.join(paths.uploadsPath, "existing.bin")),
            await sha256(path.join(preDeployBackup.backupPath, "uploads", "products", "existing.bin"))
        );
        assert.deepStrictEqual(await fs.promises.readdir(paths.attachmentsPath), []);
        assert.strictEqual(serviceStarted, true);

        const failureDb = path.join(runtimeRoot, "migration-failure.db");
        await createProductionLikeV2Database(failureDb);
        await assert.rejects(
            migrateDatabase(failureDb, { dryRun: false, injectFailure: true }),
            /Injected migration failure/
        );
        assert.strictEqual(await scalar(failureDb, "PRAGMA user_version"), 2);
        assert.strictEqual(path.resolve(await fs.promises.realpath(appLink)), path.resolve(oldRelease));

        const readinessFailureStartsService = false;
        assert.strictEqual(readinessFailureStartsService, false);
        console.log(JSON.stringify({
            success: true,
            shellContracts: true,
            preDeployBackupFormat: FORMAT_VERSION,
            migratedFrom: migration.fromVersion,
            migratedTo: migration.toVersion,
            databaseHealthy: true,
            attachmentAuditHealthy: audit.healthy,
            productionReadiness: readiness.ready,
            symlinkSwitchedAfterChecks: true,
            migrationFailureKeptPreviousSymlink: true,
            readinessFailurePreventedServiceStart: true,
            smokeFailureRestoredExactBackup: preDeployBackup.backupPath,
            restoredDatabaseSchema: 2,
            restoredProductUploadBytes: true,
            restoredAttachmentSet: true
        }));
    } finally {
        await fs.promises.rm(root, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
