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
    const requestedBackup = process.argv
        .slice(2)
        .find(argument => !argument.startsWith("--"));

    const keepTemporary = process.argv.includes("--keep");
    const backupName = requestedBackup || findLatestBackup();

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
        backupRoot: path.join(rehearsalRoot, "restore-backups"),
        lockPath: path.join(runtimeRoot, "app.lock"),
        retentionCount: 2
    };

    try {
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

        console.log(JSON.stringify({
            success: true,
            backupName,
            backupCreatedAt: verified.manifest.createdAt,
            databaseRestoredExactly: true,
            uploadsReplaced: true,
            uploadCount: verified.manifest.uploads.count,
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
