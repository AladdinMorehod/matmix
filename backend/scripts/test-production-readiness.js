const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { REQUIRED_ENV } = require("../services/legal");
const { createBackup, runtimePaths } = require("../services/productionBackup");
const { validateProductionEnvironment, operationalReadiness } = require("../services/productionReadiness");
const { CURRENT_SCHEMA_VERSION } = require("../databaseMigrations");
const { migrateDatabase } = require("../databaseMigrations");

(async () => {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-production-check-"));
    try {
        const dbPath = path.join(root, "runtime", "matmix.db"); const uploads = path.join(root, "runtime", "uploads"); const attachments = path.join(root, "runtime", "attachments"); const catalogImports = path.join(root, "runtime", "catalog-imports"); const backups = path.join(root, "backups");
        await fs.promises.mkdir(path.dirname(dbPath), { recursive: true }); await fs.promises.mkdir(uploads, { recursive: true }); await fs.promises.mkdir(attachments, { recursive: true }); await fs.promises.mkdir(catalogImports, { recursive: true }); await fs.promises.mkdir(backups, { recursive: true });
        process.env.MATMIX_DB_PATH = dbPath;
        const { initDatabase, db: initializationDb } = require("../database");
        await initDatabase();
        await new Promise((resolve, reject) => initializationDb.close(error => error ? reject(error) : resolve()));
        await migrateDatabase(dbPath, { dryRun: false });

        const fixtureDb = new sqlite3.Database(dbPath); await new Promise((resolve, reject) => fixtureDb.run(`PRAGMA user_version=${CURRENT_SCHEMA_VERSION}`, error => error ? reject(error) : resolve())); await new Promise((resolve, reject) => fixtureDb.run("UPDATE products SET image_url=NULL", error => error ? reject(error) : resolve())); await new Promise(resolve => fixtureDb.close(resolve));
        const env = { NODE_ENV: "production", PORT: "3000", SESSION_SECRET: "x".repeat(64), SESSION_DB_PATH: path.join(root, "runtime", "sessions.db"), MATMIX_DB_PATH: dbPath, PRODUCT_UPLOADS_PATH: uploads, ORDER_ATTACHMENTS_PATH: attachments, CATALOG_IMPORT_ARCHIVE_PATH: catalogImports, BACKUP_ROOT_PATH: backups, BACKUP_RETENTION_COUNT: "3", BACKUP_MAX_AGE_HOURS: "36", APP_RUNTIME_LOCK_PATH: path.join(root, "runtime", "app.lock"), PUBLIC_BASE_URL: "https://matmix.example", SEO_ALLOW_INDEXING: "false", SITE_NAME: "MatMix", DEFAULT_OG_IMAGE: "/img/logo-burgundy.png", CORS_ALLOWED_ORIGINS: "https://matmix.example", TRUST_PROXY: "1", LOGIN_RATE_WINDOW_MS: "900000", LOGIN_RATE_MAX: "5", MIN_FREE_DISK_MB: "128" };
        for (const name of REQUIRED_ENV) env[name] = "Approved test value";
        Object.assign(env, { PUBLIC_EMAIL: "legal@example.test", PUBLIC_PHONE: "+7 900 000-00-00", PRIVACY_POLICY_VERSION: "test-1", TERMS_VERSION: "test-1" });
        const paths = { dbPath, uploadsPath: uploads, attachmentsPath: attachments, catalogImportsPath: catalogImports, backupRoot: backups, lockPath: env.APP_RUNTIME_LOCK_PATH, retentionCount: 3 };
        await createBackup({ paths }); const valid = validateProductionEnvironment(env, { allowTemporaryPaths: true }); const ready = await operationalReadiness(env, { allowTemporaryPaths: true });
        const unsafe = validateProductionEnvironment({ ...env, PRODUCT_UPLOADS_PATH: path.join(__dirname, "..", "..", "public", "uploads", "products") }, { allowTemporaryPaths: true });
        const missingAttachments = validateProductionEnvironment({ ...env, ORDER_ATTACHMENTS_PATH: "" }, { allowTemporaryPaths: true });
        const deployedAttachments = validateProductionEnvironment({ ...env, ORDER_ATTACHMENTS_PATH: path.join(__dirname, "..", "private", "order-attachments") }, { allowTemporaryPaths: true });
        const missingCatalogImports = validateProductionEnvironment({ ...env, CATALOG_IMPORT_ARCHIVE_PATH: "" }, { allowTemporaryPaths: true });
        const deployedCatalogImports = validateProductionEnvironment({ ...env, CATALOG_IMPORT_ARCHIVE_PATH: path.join(__dirname, "..", "imported-excel") }, { allowTemporaryPaths: true });
        assert.throws(
            () => runtimePaths({ ...env, CATALOG_IMPORT_ARCHIVE_PATH: "" }),
            error => error?.code === "CATALOG_IMPORT_ARCHIVE_CONFIG_REQUIRED"
        );
        const temporaryAttachments = validateProductionEnvironment(env);
        if (!valid.ready || !ready.ready || unsafe.ready || missingAttachments.ready || deployedAttachments.ready || missingCatalogImports.ready || deployedCatalogImports.ready || temporaryAttachments.ready) throw new Error(JSON.stringify({ valid, ready, unsafe, missingAttachments, deployedAttachments, missingCatalogImports, deployedCatalogImports, temporaryAttachments }));
        console.log(JSON.stringify({ success: true, productionConfig: valid.ready, operationalReadiness: ready.ready, backupVerified: ready.backup.verified, attachmentsAudited: ready.attachments.healthy, catalogImportsReady: ready.checks.catalogImportsReadableWritable && ready.checks.catalogImportsPathSafe, disk: ready.diskFreeMb, unsafeWebPathRejected: !unsafe.ready, missingAttachmentPathRejected: !missingAttachments.ready, deployedAttachmentPathRejected: !deployedAttachments.ready, missingCatalogImportPathRejected: !missingCatalogImports.ready, deployedCatalogImportPathRejected: !deployedCatalogImports.ready, temporaryAttachmentPathRejected: !temporaryAttachments.ready }));
    } finally { await fs.promises.rm(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
