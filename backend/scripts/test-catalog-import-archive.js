const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ExcelJS = require("exceljs");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-catalog-archive-test-"));
const databasePath = path.join(root, "runtime", "matmix.db");
const archiveRoot = path.join(root, "persistent", "catalog-imports");
const legacyReleaseArchive = path.join(__dirname, "..", "imported-excel");
const legacyArtifactsBefore = new Set(fs.existsSync(legacyReleaseArchive) ? fs.readdirSync(legacyReleaseArchive) : []);

process.env.NODE_ENV = "production";
process.env.MATMIX_DB_PATH = databasePath;
process.env.CATALOG_IMPORT_ARCHIVE_PATH = archiveRoot;

const database = require("../database");
const {
    parseCatalogExcel,
    createCatalogImportPreviewToken,
    applyCatalogImport,
    getCatalogImportExcelCopy
} = require("../services/catalogImport");
const { ARCHIVE_FILE_PATTERN, ARCHIVE_TEMP_FILE_PATTERN, resolveCatalogImportArchivePath, writeCatalogImportArchive } = require("../services/catalogImportArchive");

const db = { all: database.all, get: database.get, run: database.run };
const user = { id: 1, name: "Catalog archive regression" };

async function catalogSnapshot() {
    const [products, structure, logs] = await Promise.all([
        database.all("SELECT id,external_id,title,category,subcategory,sort_order,updated_at FROM products ORDER BY id"),
        database.all("SELECT id,type,name,external_code,parent_id,sort_order,updated_at FROM catalog_structure ORDER BY id"),
        database.get("SELECT COUNT(*) count FROM catalog_import_logs")
    ]);
    return { products, structure, importLogs: Number(logs?.count || 0) };
}

async function createPreview(buffer, name) {
    const parsed = await parseCatalogExcel(buffer);
    const preview = await createCatalogImportPreviewToken(db, parsed, {
        name,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }, user, buffer);
    assert.strictEqual(preview.canImport, true, JSON.stringify({ summary: preview.summary, errors: preview.errors, warnings: preview.warnings }));
    return preview;
}

async function waitForDistinctBackupTimestamp() {
    await new Promise(resolve => setTimeout(resolve, 1100));
}

async function createCatalogWorkbookBuffer() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ШАБЛОН");
    sheet.addRow(["Категория - Архивная категория", "Категория - Архивная категория", null, null, null, null, null, null, null, null, "CAT-000001"]);
    sheet.addRow(["Подкатегория - Архивная подкатегория", "Подкатегория - Архивная подкатегория", null, null, null, null, null, null, null, null, "SUB-000001"]);
    sheet.addRow(["Архивный товар", "Архивный товар", null, "шт", 100, null, null, "", null, 1, "MAT-000001"]);
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function main() {
    await fs.promises.mkdir(path.dirname(databasePath), { recursive: true });
    await database.initDatabase();
    await database.run("DELETE FROM products");
    await database.run("DELETE FROM catalog_structure");
    const now = new Date().toISOString();
    const category = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('category',?,?,?,?,?,1,0,?,?)",
        ["Архивная категория", "архивная категория", "CAT-000001", null, 1, now, now]
    );
    await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,?,1,0,?,?)",
        ["Архивная подкатегория", "архивная подкатегория", "SUB-000001", category.id, 1, now, now]
    );
    await database.run(
        `INSERT INTO products(external_id,title,category,subcategory,product_group,price,weight,unit,is_active,sort_order,source,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,1,1,'excel',?,?)`,
        ["MAT-000001", "Архивный товар", "Архивная категория", "Архивная подкатегория", "", 100, 1, "шт", now, now]
    );

    assert.strictEqual((await database.get("SELECT COUNT(*) count FROM products")).count, 1);
    assert.strictEqual((await database.get("SELECT COUNT(*) count FROM catalog_structure")).count, 2);
    const workbookBuffer = await createCatalogWorkbookBuffer();

    const collisionRoot = path.join(root, "persistent", "collision-catalog-imports");
    const collisionOptions = { now: new Date("2026-01-01T00:00:00.000Z"), randomBytes: size => Buffer.alloc(size, 0xab) };
    const collisionPath = await writeCatalogImportArchive(workbookBuffer, { NODE_ENV: "production", CATALOG_IMPORT_ARCHIVE_PATH: collisionRoot }, collisionOptions);
    await assert.rejects(
        () => writeCatalogImportArchive(Buffer.from("must not overwrite"), { NODE_ENV: "production", CATALOG_IMPORT_ARCHIVE_PATH: collisionRoot }, collisionOptions),
        error => error?.code === "EEXIST"
    );
    assert.deepStrictEqual(await fs.promises.readFile(collisionPath), workbookBuffer);
    assert(!(await fs.promises.readdir(collisionRoot)).some(name => ARCHIVE_TEMP_FILE_PATTERN.test(name)));

    const tempCollisionRoot = path.join(root, "persistent", "temp-collision-catalog-imports");
    await fs.promises.mkdir(tempCollisionRoot, { recursive: true });
    const tempCollisionPath = path.join(tempCollisionRoot, ".catalog-import-abababababababab.tmp");
    const foreignTempBytes = Buffer.from("another writer still owns this temp file");
    await fs.promises.writeFile(tempCollisionPath, foreignTempBytes, { flag: "wx" });
    await assert.rejects(
        () => writeCatalogImportArchive(workbookBuffer, { NODE_ENV: "production", CATALOG_IMPORT_ARCHIVE_PATH: tempCollisionRoot }, collisionOptions),
        error => error?.code === "EEXIST"
    );
    assert.deepStrictEqual(await fs.promises.readFile(tempCollisionPath), foreignTempBytes);

    if (process.platform !== "win32") {
        const symlinkTarget = path.join(root, "persistent", "symlink-target");
        const symlinkRoot = path.join(root, "persistent", "symlink-root");
        await fs.promises.mkdir(symlinkTarget, { recursive: true });
        await fs.promises.symlink(symlinkTarget, symlinkRoot, "dir");
        await assert.rejects(
            () => writeCatalogImportArchive(workbookBuffer, { NODE_ENV: "production", CATALOG_IMPORT_ARCHIVE_PATH: symlinkRoot }),
            error => error?.code === "CATALOG_IMPORT_ARCHIVE_PATH_UNSAFE"
        );
    }

    const firstPreview = await createPreview(workbookBuffer, "../../user-controlled-name.xlsx");
    const firstResult = await applyCatalogImport(db, firstPreview.token, {}, user);
    assert.strictEqual(firstResult.success, true);
    assert.strictEqual(path.dirname(firstResult.excelCopyPath), path.resolve(archiveRoot));
    assert(ARCHIVE_FILE_PATTERN.test(path.basename(firstResult.excelCopyPath)));
    assert(fs.existsSync(firstResult.excelCopyPath));
    assert(!path.basename(firstResult.excelCopyPath).includes("user-controlled"));
    assert.strictEqual((await getCatalogImportExcelCopy(db, firstResult.importLogId)).path, firstResult.excelCopyPath);
    assert.strictEqual((await database.get("SELECT COUNT(*) count FROM catalog_import_logs")).count, 1);
    await assert.rejects(
        () => applyCatalogImport(db, firstPreview.token, {}, user),
        error => error?.code === "PREVIEW_TOKEN_EXPIRED"
    );

    const legacyArtifactsAfterSuccess = new Set(fs.existsSync(legacyReleaseArchive) ? fs.readdirSync(legacyReleaseArchive) : []);
    assert.deepStrictEqual(legacyArtifactsAfterSuccess, legacyArtifactsBefore);

    await assert.rejects(
        () => getCatalogImportExcelCopy({ get: async () => ({ excel_copy_path: path.join(root, "outside.xlsx") }) }, 1),
        error => error?.code === "EXCEL_COPY_NOT_FOUND"
    );
    assert.throws(
        () => resolveCatalogImportArchivePath({ NODE_ENV: "production", CATALOG_IMPORT_ARCHIVE_PATH: path.join(__dirname, "..", "..", "public", "catalog-imports") }),
        error => error?.code === "CATALOG_IMPORT_ARCHIVE_PATH_UNSAFE"
    );

    await waitForDistinctBackupTimestamp();
    const writeFailurePreview = await createPreview(workbookBuffer, "archive-write-failure.xlsx");
    const writeFailureSnapshot = await catalogSnapshot();
    const invalidArchivePath = path.join(root, "archive-path-is-a-file");
    await fs.promises.writeFile(invalidArchivePath, "not a directory");
    process.env.CATALOG_IMPORT_ARCHIVE_PATH = invalidArchivePath;
    await assert.rejects(() => applyCatalogImport(db, writeFailurePreview.token, {}, user));
    assert.deepStrictEqual(await catalogSnapshot(), writeFailureSnapshot);

    const retryArchiveRoot = path.join(root, "persistent", "retry-catalog-imports");
    process.env.CATALOG_IMPORT_ARCHIVE_PATH = retryArchiveRoot;
    const transactionEvents = [];
    const instrumentedDb = {
        all: (...args) => db.all(...args),
        get: (...args) => db.get(...args),
        run: async (...args) => {
            transactionEvents.push(String(args[0] || "").replace(/\s+/g, " ").trim());
            return db.run(...args);
        }
    };
    await assert.rejects(
        () => applyCatalogImport(instrumentedDb, writeFailurePreview.token, {}, user, {
            archiveOptions: {
                afterTempWritten: async ({ tempPath, filePath }) => {
                    assert(transactionEvents.some(sql => /^BEGIN IMMEDIATE/i.test(sql)));
                    assert(transactionEvents.some(sql => /^(INSERT|UPDATE|DELETE)/i.test(sql)), JSON.stringify(transactionEvents));
                    assert(fs.existsSync(tempPath));
                    assert(!fs.existsSync(filePath));
                    throw new Error("injected archive finalization failure");
                }
            }
        }),
        /injected archive finalization failure/
    );
    assert.deepStrictEqual(await catalogSnapshot(), writeFailureSnapshot);
    assert.deepStrictEqual(await fs.promises.readdir(retryArchiveRoot), []);
    await waitForDistinctBackupTimestamp();
    const retryResult = await applyCatalogImport(db, writeFailurePreview.token, {}, user);
    assert.strictEqual(retryResult.success, true);
    assert.strictEqual((await database.get("SELECT COUNT(*) count FROM catalog_import_logs")).count, 2);

    await waitForDistinctBackupTimestamp();
    const dbFailurePreview = await createPreview(workbookBuffer, "db-failure-after-archive.xlsx");
    const dbFailureSnapshot = await catalogSnapshot();
    const dbFailureArchiveRoot = path.join(root, "persistent", "db-failure-catalog-imports");
    process.env.CATALOG_IMPORT_ARCHIVE_PATH = dbFailureArchiveRoot;
    await assert.rejects(
        () => applyCatalogImport(db, dbFailurePreview.token, {}, user, {
            afterArchivePrepared: async () => { throw new Error("injected DB failure after archive preparation"); }
        }),
        /injected DB failure/
    );
    assert.deepStrictEqual(await catalogSnapshot(), dbFailureSnapshot);
    assert.deepStrictEqual(await fs.promises.readdir(dbFailureArchiveRoot), []);

    await waitForDistinctBackupTimestamp();
    const finalResult = await applyCatalogImport(db, dbFailurePreview.token, {}, user);
    assert.strictEqual(finalResult.success, true);
    assert.strictEqual((await database.get("SELECT COUNT(*) count FROM catalog_import_logs")).count, 3);
    await assert.rejects(
        () => applyCatalogImport(db, dbFailurePreview.token, {}, user),
        error => error?.code === "PREVIEW_TOKEN_EXPIRED"
    );

    await waitForDistinctBackupTimestamp();
    const concurrentPreview = await createPreview(workbookBuffer, "concurrent-apply.xlsx");
    const logsBeforeConcurrent = Number((await database.get("SELECT COUNT(*) count FROM catalog_import_logs")).count);
    const archivesBeforeConcurrent = new Set(await fs.promises.readdir(dbFailureArchiveRoot));
    const concurrentResults = await Promise.allSettled([
        applyCatalogImport(db, concurrentPreview.token, {}, user),
        applyCatalogImport(db, concurrentPreview.token, {}, user)
    ]);
    const successes = concurrentResults.filter(item => item.status === "fulfilled");
    const failures = concurrentResults.filter(item => item.status === "rejected");
    assert.strictEqual(successes.length, 1);
    assert.strictEqual(failures.length, 1);
    assert.strictEqual(failures[0].reason?.code, "IMPORT_ALREADY_RUNNING");
    assert.strictEqual(Number((await database.get("SELECT COUNT(*) count FROM catalog_import_logs")).count), logsBeforeConcurrent + 1);
    const archivesAfterConcurrent = await fs.promises.readdir(dbFailureArchiveRoot);
    assert.strictEqual(archivesAfterConcurrent.filter(name => !archivesBeforeConcurrent.has(name)).length, 1);
    await assert.rejects(
        () => applyCatalogImport(db, concurrentPreview.token, {}, user),
        error => error?.code === "PREVIEW_TOKEN_EXPIRED"
    );

    console.log(JSON.stringify({
        success: true,
        persistentArchiveOutsideRelease: "ok",
        serverGeneratedFilename: "ok",
        archiveFailureBeforeCommit: "rollback",
        dbFailureAfterArchivePreparation: "rollback-and-archive-cleanup",
        retryAfterSafeFailure: "ok",
        tokenAfterCommit: "consumed",
        concurrentDoubleApply: "one-commit-one-conflict",
        committedImports: 4
    }));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(async () => {
    await new Promise(resolve => database.db.close(() => resolve()));
    fs.rmSync(root, { recursive: true, force: true });
});
