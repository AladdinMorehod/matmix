const fs = require("fs");
const path = require("path");
const { run, get, all, databasePath } = require("../database");
const {
    ensureCatalogStructureSchema,
    normalizeCatalogStructureName
} = require("../services/catalogStructure");

const DUPLICATE_GROUPS = [
    { canonicalId: 177, canonicalCode: "SUB-000163", duplicateId: 248, duplicateCode: "SUB-000221" },
    { canonicalId: 178, canonicalCode: "SUB-000164", duplicateId: 249, duplicateCode: "SUB-000222" },
    { canonicalId: 209, canonicalCode: "SUB-000193", duplicateId: 250, duplicateCode: "SUB-000223" }
];

const SYSTEM_RECORDS = [
    { id: 223, code: "SUB-000224", reason: "fallback-subcategory" }
];

function timestampForFile(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function createBackup() {
    if (!fs.existsSync(databasePath)) {
        throw new Error(`Database not found: ${databasePath}`);
    }

    const backupsDir = path.join(path.dirname(databasePath), "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const baseName = `matmix-before-structure-cleanup-${timestampForFile()}`;
    let backupPath = path.join(backupsDir, `${baseName}.db`);
    let suffix = 2;
    while (fs.existsSync(backupPath)) {
        backupPath = path.join(backupsDir, `${baseName}-${suffix}.db`);
        suffix += 1;
    }
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

async function hasColumn(tableName, columnName) {
    const columns = await all(`PRAGMA table_info(${tableName})`);
    return columns.some(column => column.name === columnName);
}

async function loadStructureRows() {
    const hasSystemColumn = await hasColumn("catalog_structure", "is_system");
    return all(`
        SELECT id,
               type,
               name,
               normalized_name,
               external_code,
               parent_id,
               sort_order,
               is_active,
               ${hasSystemColumn ? "is_system" : "0 AS is_system"},
               created_at,
               updated_at
        FROM catalog_structure
        WHERE type IN ('category', 'subcategory')
        ORDER BY type, parent_id, sort_order, id
    `);
}

function publicStructureRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        type: row.type,
        name: row.name,
        normalizedName: row.normalized_name,
        expectedNormalizedName: normalizeCatalogStructureName(row.name),
        externalCode: row.external_code || "",
        parentId: row.parent_id || null,
        sortOrder: Number(row.sort_order) || 0,
        isActive: Number(row.is_active) === 1,
        isSystem: Number(row.is_system) === 1
    };
}

async function getReferenceUpdates(groups) {
    const tables = await all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const duplicateToCanonical = new Map(groups.map(group => [group.duplicateId, group.canonicalId]));
    const updates = [];
    const inspected = [];

    for (const table of tables) {
        const foreignKeys = await all(`PRAGMA foreign_key_list(${table.name})`);
        const catalogForeignKeys = foreignKeys.filter(item => item.table === "catalog_structure" && item.to === "id");
        for (const foreignKey of catalogForeignKeys) {
            inspected.push({ table: table.name, column: foreignKey.from, target: "catalog_structure.id" });
            for (const [duplicateId, canonicalId] of duplicateToCanonical.entries()) {
                const countRow = await get(
                    `SELECT COUNT(*) AS count FROM ${table.name} WHERE ${foreignKey.from} = ?`,
                    [duplicateId]
                );
                if (Number(countRow?.count) > 0) {
                    updates.push({
                        table: table.name,
                        column: foreignKey.from,
                        fromId: duplicateId,
                        toId: canonicalId,
                        count: Number(countRow.count)
                    });
                }
            }
        }
    }

    return { inspected, updates };
}

function getDuplicateSemanticGroups(finalRows) {
    const byKey = new Map();
    finalRows
        .filter(row => row.type === "subcategory" && Number(row.is_active) === 1 && Number(row.is_system) !== 1)
        .forEach(row => {
            const key = `${row.parent_id || 0}:${row.normalized_name}`;
            if (!byKey.has(key)) byKey.set(key, []);
            byKey.get(key).push(row);
        });

    return Array.from(byKey.values())
        .filter(items => items.length > 1)
        .map(items => ({
            parentId: items[0].parent_id || null,
            normalizedName: items[0].normalized_name,
            ids: items.map(item => item.id)
        }));
}

function getDuplicateExternalCodes(finalRows) {
    const byCode = new Map();
    finalRows.forEach(row => {
        if (!row.external_code) return;
        if (!byCode.has(row.external_code)) byCode.set(row.external_code, []);
        byCode.get(row.external_code).push(row.id);
    });

    return Array.from(byCode.entries())
        .filter(([, ids]) => ids.length > 1)
        .map(([externalCode, ids]) => ({ externalCode, ids }));
}

async function buildCleanupPlan() {
    const rows = await loadStructureRows();
    const rowsById = new Map(rows.map(row => [Number(row.id), row]));
    const conflicts = [];
    const canonicalRecords = [];
    const duplicateRecords = [];
    const systemRecords = [];
    const rowUpdates = new Map();

    function queueRowUpdate(row, fields, reason) {
        if (!rowUpdates.has(row.id)) {
            rowUpdates.set(row.id, {
                id: row.id,
                name: row.name,
                type: row.type,
                old: publicStructureRow(row),
                set: {},
                reasons: []
            });
        }
        const item = rowUpdates.get(row.id);
        Object.assign(item.set, fields);
        item.reasons.push(reason);
    }

    DUPLICATE_GROUPS.forEach(group => {
        const canonical = rowsById.get(group.canonicalId);
        const duplicate = rowsById.get(group.duplicateId);
        canonicalRecords.push(publicStructureRow(canonical));
        duplicateRecords.push(publicStructureRow(duplicate));

        if (!canonical) conflicts.push({ type: "missing-canonical", group });
        if (!duplicate) conflicts.push({ type: "missing-duplicate", group });
        if (canonical && canonical.external_code !== group.canonicalCode) {
            conflicts.push({ type: "canonical-code-mismatch", id: canonical.id, expected: group.canonicalCode, actual: canonical.external_code || "" });
        }
        if (duplicate && duplicate.external_code !== group.duplicateCode) {
            conflicts.push({ type: "duplicate-code-mismatch", id: duplicate.id, expected: group.duplicateCode, actual: duplicate.external_code || "" });
        }
        if (canonical && Number(canonical.is_active) !== 1) {
            queueRowUpdate(canonical, { is_active: 1 }, "keep-canonical-active");
        }
        if (duplicate && Number(duplicate.is_active) !== 0) {
            queueRowUpdate(duplicate, { is_active: 0 }, "deactivate-duplicate");
        }
    });

    SYSTEM_RECORDS.forEach(item => {
        const row = rowsById.get(item.id);
        systemRecords.push(publicStructureRow(row));
        if (!row) {
            conflicts.push({ type: "missing-system-record", item });
            return;
        }
        if (row.external_code !== item.code) {
            conflicts.push({ type: "system-code-mismatch", id: row.id, expected: item.code, actual: row.external_code || "" });
        }
        if (Number(row.is_system) !== 1) {
            queueRowUpdate(row, { is_system: 1 }, "mark-system-record");
        }
    });

    rows.forEach(row => {
        const normalizedName = normalizeCatalogStructureName(row.name);
        if (row.normalized_name !== normalizedName) {
            queueRowUpdate(row, { normalized_name: normalizedName }, "normalize-name");
        }
    });

    const references = await getReferenceUpdates(DUPLICATE_GROUPS);
    const finalRows = rows.map(row => {
        const update = rowUpdates.get(row.id);
        return { ...row, ...(update?.set || {}) };
    });
    const duplicateExternalCodes = getDuplicateExternalCodes(finalRows);
    const activeDuplicateSubcategories = getDuplicateSemanticGroups(finalRows);

    if (duplicateExternalCodes.length) {
        conflicts.push({ type: "duplicate-external-code-after-cleanup", items: duplicateExternalCodes });
    }
    if (activeDuplicateSubcategories.length) {
        conflicts.push({ type: "active-duplicate-subcategory-after-cleanup", items: activeDuplicateSubcategories });
    }

    const structureRowsToUpdate = Array.from(rowUpdates.values()).map(item => ({
        ...item,
        next: {
            ...item.old,
            normalizedName: item.set.normalized_name ?? item.old.normalizedName,
            isActive: item.set.is_active === undefined ? item.old.isActive : Number(item.set.is_active) === 1,
            isSystem: item.set.is_system === undefined ? item.old.isSystem : Number(item.set.is_system) === 1
        }
    }));

    return {
        mode: "preview",
        canonicalRecords,
        duplicateRecords,
        systemRecords,
        referenceUpdates: references.updates,
        inspectedReferences: references.inspected,
        structureRowsToUpdate,
        inactiveDuplicates: structureRowsToUpdate.filter(item => item.reasons.includes("deactivate-duplicate")).map(item => item.id),
        systemRowsToMark: structureRowsToUpdate.filter(item => item.reasons.includes("mark-system-record")).map(item => item.id),
        normalizedRows: structureRowsToUpdate.filter(item => item.reasons.includes("normalize-name")).map(item => item.id),
        conflicts,
        activeDuplicateSubcategories,
        duplicateExternalCodes,
        actualUpdatedRows: structureRowsToUpdate.length + references.updates.reduce((sum, item) => sum + item.count, 0)
    };
}

async function applyCleanupPlan(plan) {
    const now = new Date().toISOString();

    for (const item of plan.referenceUpdates) {
        await run(
            `UPDATE ${item.table} SET ${item.column} = ? WHERE ${item.column} = ?`,
            [item.toId, item.fromId]
        );
    }

    for (const item of plan.structureRowsToUpdate) {
        const fields = [];
        const params = [];
        if (item.set.normalized_name !== undefined) {
            fields.push("normalized_name = ?");
            params.push(item.set.normalized_name);
        }
        if (item.set.is_active !== undefined) {
            fields.push("is_active = ?");
            params.push(item.set.is_active);
        }
        if (item.set.is_system !== undefined) {
            fields.push("is_system = ?");
            params.push(item.set.is_system);
        }
        if (!fields.length) continue;
        fields.push("updated_at = ?");
        params.push(now, item.id);
        await run(`UPDATE catalog_structure SET ${fields.join(", ")} WHERE id = ?`, params);
    }
}

async function getFinalChecks() {
    const rows = await loadStructureRows();
    const integrity = await get("PRAGMA integrity_check");
    const foreignKeys = await all("PRAGMA foreign_key_check");
    const activeTotals = await all(`
        SELECT type,
               COUNT(*) AS total,
               SUM(CASE WHEN external_code IS NOT NULL AND external_code != '' THEN 1 ELSE 0 END) AS coded
        FROM catalog_structure
        WHERE is_active = 1
          AND COALESCE(is_system, 0) = 0
          AND type IN ('category', 'subcategory')
        GROUP BY type
        ORDER BY type
    `);
    const systemRows = rows.filter(row => Number(row.is_system) === 1).map(publicStructureRow);
    const inactiveDuplicateRows = DUPLICATE_GROUPS
        .map(group => rows.find(row => Number(row.id) === group.duplicateId))
        .filter(Boolean)
        .filter(row => Number(row.is_active) === 0)
        .map(publicStructureRow);

    return {
        activeTotals,
        systemRows,
        inactiveDuplicateRows,
        duplicateExternalCodes: getDuplicateExternalCodes(rows),
        activeDuplicateSubcategories: getDuplicateSemanticGroups(rows),
        integrity: integrity?.integrity_check || "",
        foreignKeyIssues: foreignKeys.length
    };
}

async function cleanupCatalogStructure({ apply = false } = {}) {
    const initialPlan = await buildCleanupPlan();
    if (!apply) return initialPlan;

    if (initialPlan.conflicts.length) {
        return {
            ...initialPlan,
            success: false,
            blocked: true,
            reason: "Conflicts detected before cleanup."
        };
    }

    const backupPath = createBackup();
    await run("BEGIN IMMEDIATE TRANSACTION");
    try {
        await ensureCatalogStructureSchema({ run, all });
        const plan = await buildCleanupPlan();
        if (plan.conflicts.length) {
            throw new Error(`Conflicts detected inside transaction: ${JSON.stringify(plan.conflicts)}`);
        }
        await applyCleanupPlan(plan);
        await run("COMMIT");
    } catch (error) {
        await run("ROLLBACK").catch(() => {});
        throw error;
    }

    const afterPlan = await buildCleanupPlan();
    const checks = await getFinalChecks();
    return {
        ...afterPlan,
        mode: "apply",
        success: true,
        backupPath,
        checks,
        actualUpdatedRows: initialPlan.actualUpdatedRows
    };
}

async function main() {
    try {
        const apply = process.argv.includes("--apply");
        const report = await cleanupCatalogStructure({ apply });
        console.log(JSON.stringify(report, null, 2));
        if (report.blocked || report.conflicts?.length || report.checks?.integrity && report.checks.integrity !== "ok" || report.checks?.foreignKeyIssues) {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(error.message || error);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    cleanupCatalogStructure,
    buildCleanupPlan
};
