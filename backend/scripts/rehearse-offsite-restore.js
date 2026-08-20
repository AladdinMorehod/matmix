const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const sqlite3 = require("sqlite3").verbose();

const { restore } = require("./restore-production-data");
const {
    sha256,
    verifyBackup,
    verifyDatabase
} = require("../services/productionBackup");

const RCLONE_CONFIG =
    process.env.MATMIX_RCLONE_CONFIG ||
    "/var/lib/matmix/rclone/rclone.conf";

const RCLONE_REMOTE =
    process.env.MATMIX_BACKUP_REMOTE ||
    "matmix-encrypted";

function run(command, args, options = {}) {
    return execFileSync(command, args, {
        encoding: "utf8",
        stdio: options.capture
            ? ["ignore", "pipe", "inherit"]
            : "inherit"
    });
}

function runSql(dbPath, sql) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        db.run(sql, error => {
            db.close(closeError => {
                if (error || closeError) {
                    reject(error || closeError);
                } else {
                    resolve();
                }
            });
        });
    });
}

async function copyTree(source, target) {
    await fs.promises.mkdir(target, { recursive: true });

    for (const entry of await fs.promises.readdir(source, {
        withFileTypes: true
    })) {
        const src = path.join(source, entry.name);
        const dst = path.join(target, entry.name);

        if (entry.isSymbolicLink()) {
            throw new Error(`Symbolic link refused: ${src}`);
        }

        if (entry.isDirectory()) {
            await copyTree(src, dst);
        } else if (entry.isFile()) {
            await fs.promises.copyFile(src, dst);
        }
    }
}

async function snapshotTree(root) {
    const files = [];
    async function walk(current, prefix = "") {
        for (const entry of await fs.promises.readdir(current, { withFileTypes: true })) {
            const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
            const target = path.join(current, entry.name);
            if (entry.isSymbolicLink()) throw new Error(`Symbolic link refused: ${target}`);
            if (entry.isDirectory()) await walk(target, relative);
            else if (entry.isFile()) {
                const stat = await fs.promises.stat(target);
                files.push({ relativePath: relative, size: stat.size, sha256: await sha256(target) });
            }
        }
    }
    await walk(root);
    return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function findLatestBackup() {
    const output = run(
        "sudo",
        [
            "rclone",
            "--config",
            RCLONE_CONFIG,
            "lsf",
            `${RCLONE_REMOTE}:`,
            "--dirs-only"
        ],
        { capture: true }
    );

    const backups = output
        .split(/\r?\n/)
        .map(value => value.replace(/\/$/, "").trim())
        .filter(value => /^matmix-backup-/.test(value))
        .sort();

    if (!backups.length) {
        throw new Error("No off-site MatMix backups found.");
    }

    return backups.at(-1);
}

async function main() {
    const args = process.argv.slice(2);
    const localSourceIndex = args.indexOf("--local-source");
    const localSource = localSourceIndex >= 0 ? path.resolve(args[localSourceIndex + 1] || "") : null;
    const requestedBackup = localSource ? null : args.find(argument => !argument.startsWith("--"));
    const keepTemporary = args.includes("--keep");
    const backupName = localSource ? path.basename(localSource) : (requestedBackup || findLatestBackup());

    if (!/^matmix-backup-[A-Za-z0-9._-]+$/.test(backupName)) {
        throw new Error(`Unsafe backup name: ${backupName}`);
    }

    const rehearsalRoot = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "matmix-offsite-restore-")
    );

    const sourcePath = path.join(rehearsalRoot, "source");
    const runtimeRoot = path.join(rehearsalRoot, "runtime");

    const paths = {
        dbPath: path.join(runtimeRoot, "matmix.db"),
        uploadsPath: path.join(runtimeRoot, "uploads"),
        attachmentsPath: path.join(runtimeRoot, "attachments"),
        catalogImportsPath: path.join(runtimeRoot, "catalog-imports"),
        backupRoot: path.join(rehearsalRoot, "restore-backups"),
        lockPath: path.join(runtimeRoot, "app.lock"),
        retentionCount: 2
    };

    try {
        if (localSource) {
            const localStat = await fs.promises.lstat(localSource);
            if (localStat.isSymbolicLink() || !localStat.isDirectory()) throw new Error("Local rehearsal source must be a real backup directory.");
            console.log(`Copying local rehearsal source: ${backupName}`);
            await copyTree(localSource, sourcePath);
        } else {
            console.log(`Downloading ${RCLONE_REMOTE}:${backupName}`);
            run("sudo", [
                "rclone",
                "--config",
                RCLONE_CONFIG,
                "copy",
                `${RCLONE_REMOTE}:${backupName}`,
                sourcePath,
                "--checkers",
                "4",
                "--transfers",
                "2"
            ]);
            run("sudo", [
                "chown",
                "-R",
                `${process.getuid()}:${process.getgid()}`,
                rehearsalRoot
            ]);
        }

        const verified = await verifyBackup(sourcePath);

        await fs.promises.mkdir(path.dirname(paths.dbPath), {
            recursive: true
        });

        await fs.promises.copyFile(
            path.join(sourcePath, "database", "matmix.db"),
            paths.dbPath
        );

        await copyTree(
            path.join(sourcePath, "uploads", "products"),
            paths.uploadsPath
        );
        if (verified.manifest.formatVersion >= 2) {
            await copyTree(
                path.join(sourcePath, "attachments", "orders"),
                paths.attachmentsPath
            );
        } else {
            await fs.promises.mkdir(paths.attachmentsPath, { recursive: true });
        }
        if (verified.manifest.formatVersion >= 3) {
            await copyTree(
                path.join(sourcePath, "catalog-imports"),
                paths.catalogImportsPath
            );
        } else {
            await fs.promises.mkdir(paths.catalogImportsPath, { recursive: true });
        }

        const sourceArchiveSnapshot = verified.manifest.formatVersion >= 3
            ? await snapshotTree(path.join(sourcePath, "catalog-imports"))
            : null;
        const sourceDbHash = await sha256(
            path.join(sourcePath, "database", "matmix.db")
        );

        await runSql(
            paths.dbPath,
            `UPDATE products
             SET title = title || ' [OFFSITE RESTORE REHEARSAL]'
             WHERE id = (SELECT MIN(id) FROM products)`
        );

        const markerName = `rehearsal-${crypto.randomBytes(4).toString("hex")}.txt`;
        const markerPath = path.join(paths.uploadsPath, markerName);

        await fs.promises.writeFile(
            markerPath,
            "This file must disappear after restore.\n"
        );
        if (verified.manifest.formatVersion >= 3) {
            await fs.promises.writeFile(
                path.join(paths.catalogImportsPath, `.catalog-import-${crypto.randomBytes(8).toString("hex")}.tmp`),
                "This archive marker must disappear after restore.\n"
            );
        }

        if (await sha256(paths.dbPath) === sourceDbHash) {
            throw new Error("Database mutation was not applied.");
        }

        const restored = await restore(sourcePath, {
            paths,
            apply: true,
            confirm: "RESTORE_MATMIX_DATA"
        });

        await verifyDatabase(paths.dbPath);

        const restoredDbHash = await sha256(paths.dbPath);

        if (restoredDbHash !== sourceDbHash) {
            throw new Error("Restored database differs from backup source.");
        }

        if (fs.existsSync(markerPath)) {
            throw new Error("Uploads directory was not replaced.");
        }
        const restoredArchiveSnapshot = verified.manifest.formatVersion >= 3
            ? await snapshotTree(paths.catalogImportsPath)
            : null;
        if (sourceArchiveSnapshot && JSON.stringify(restoredArchiveSnapshot) !== JSON.stringify(sourceArchiveSnapshot)) {
            throw new Error("Restored catalog import archive differs from backup source.");
        }

        console.log(JSON.stringify({
            success: true,
            backupName,
            backupCreatedAt: verified.manifest.createdAt,
            databaseRestoredExactly: true,
            catalogImportsRestoredExactly: verified.manifest.formatVersion >= 3,
            uploadsReplaced: true,
            uploadCount: verified.manifest.uploads.count,
            attachmentCount: verified.manifest.attachments?.fileCount || 0,
            catalogImportCount: verified.manifest.catalogImports?.fileCount || 0,
            references: restored.references,
            emergencyBackup: restored.emergencyBackup,
            temporaryPath: keepTemporary ? rehearsalRoot : null
        }, null, 2));
    } finally {
        if (!keepTemporary) {
            await fs.promises.rm(rehearsalRoot, {
                recursive: true,
                force: true
            });
        } else {
            console.log(`Temporary files retained: ${rehearsalRoot}`);
        }
    }
}

main().catch(error => {
    console.error(`Off-site restore rehearsal failed: ${error.message}`);
    process.exitCode = 1;
});
