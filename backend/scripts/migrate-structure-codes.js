const fs = require("fs");
const path = require("path");
const { initDatabase, run, get, all, databasePath } = require("../database");
const {
    parseCatalogExcel,
    formatCategoryCode,
    formatSubcategoryCode,
    normalizeCategoryCode,
    normalizeSubcategoryCode,
    validateCategoryCode,
    validateSubcategoryCode
} = require("../services/catalogImport");
const { normalizeCatalogStructureName } = require("../services/catalogStructure");

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
    const backupPath = path.join(backupsDir, `matmix-before-structure-codes-${timestampForFile()}.db`);
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

function getCodeNumber(value) {
    const match = String(value || "").match(/^(?:CAT|SUB)-(\d{6,})$/i);
    return match ? Number(match[1]) : 0;
}

function makeStructureKey(parentId, name) {
    return `${Number(parentId) || 0}:${normalizeCatalogStructureName(name)}`;
}

function toPublicRow(row) {
    return {
        id: row.id,
        type: row.type,
        name: row.name,
        normalizedName: row.normalized_name,
        externalCode: row.external_code || "",
        parentId: row.parent_id || null,
        parentName: row.parent_name || "",
        parentCode: row.parent_code || "",
        sortOrder: Number(row.sort_order) || 0,
        isActive: Number(row.is_active) === 1
    };
}

function pushUpdate(plan, row, nextCode, source, details = {}) {
    const oldCode = row.external_code || "";
    if (oldCode === nextCode) return false;

    plan.push({
        id: row.id,
        type: row.type,
        oldCode,
        newCode: nextCode,
        source,
        name: row.name,
        parentId: row.parent_id || null,
        parentName: row.parent_name || "",
        ...details
    });
    row.external_code = nextCode;
    return true;
}

function findCategoryForExcel(row, categoriesByCode, categoriesByName) {
    if (row.externalCode) {
        const byCode = categoriesByCode.get(normalizeCategoryCode(row.externalCode));
        if (byCode) return { row: byCode, method: "cat-code" };
    }

    const matches = categoriesByName.get(normalizeCatalogStructureName(row.name)) || [];
    if (matches.length === 1) return { row: matches[0], method: "name" };
    if (matches.length > 1) return { ambiguous: matches, method: "name" };
    return { row: null, method: "name" };
}

function getSubcategoryCandidates(row, parent, subcategoriesByCode, subcategoriesByParentAndName, subcategoriesByName) {
    if (row.externalCode) {
        const byCode = subcategoriesByCode.get(normalizeSubcategoryCode(row.externalCode));
        if (byCode) return { candidates: [byCode], method: "sub-code" };
    }

    if (parent) {
        const byParentAndName = subcategoriesByParentAndName.get(makeStructureKey(parent.id, row.name)) || [];
        if (byParentAndName.length) return { candidates: byParentAndName, method: "parent-and-name" };
    }

    return {
        candidates: subcategoriesByName.get(normalizeCatalogStructureName(row.name)) || [],
        method: "name-fallback"
    };
}

function chooseCanonical(candidates) {
    return candidates
        .slice()
        .sort((first, second) => {
            const firstCoded = first.external_code ? 1 : 0;
            const secondCoded = second.external_code ? 1 : 0;
            return firstCoded - secondCoded
                || (Number(first.sort_order) || 0) - (Number(second.sort_order) || 0)
                || Number(first.id) - Number(second.id);
        })[0] || null;
}

async function loadStructureRows() {
    return all(`
        SELECT s.*,
               p.name AS parent_name,
               p.external_code AS parent_code
        FROM catalog_structure s
        LEFT JOIN catalog_structure p ON p.id = s.parent_id
        WHERE s.type IN ('category', 'subcategory')
        ORDER BY s.type, s.parent_id, s.sort_order, s.id
    `);
}

function createIndexes(rows) {
    const categories = rows.filter(row => row.type === "category");
    const subcategories = rows.filter(row => row.type === "subcategory");
    const categoriesByCode = new Map();
    const categoriesByName = new Map();
    const subcategoriesByCode = new Map();
    const subcategoriesByParentAndName = new Map();
    const subcategoriesByName = new Map();

    categories.forEach(row => {
        if (row.external_code) categoriesByCode.set(normalizeCategoryCode(row.external_code), row);
        const nameKey = normalizeCatalogStructureName(row.name);
        if (!categoriesByName.has(nameKey)) categoriesByName.set(nameKey, []);
        categoriesByName.get(nameKey).push(row);
    });

    subcategories.forEach(row => {
        if (row.external_code) subcategoriesByCode.set(normalizeSubcategoryCode(row.external_code), row);

        const parentKey = makeStructureKey(row.parent_id, row.name);
        if (!subcategoriesByParentAndName.has(parentKey)) subcategoriesByParentAndName.set(parentKey, []);
        subcategoriesByParentAndName.get(parentKey).push(row);

        const nameKey = normalizeCatalogStructureName(row.name);
        if (!subcategoriesByName.has(nameKey)) subcategoriesByName.set(nameKey, []);
        subcategoriesByName.get(nameKey).push(row);
    });

    return {
        categories,
        subcategories,
        categoriesByCode,
        categoriesByName,
        subcategoriesByCode,
        subcategoriesByParentAndName,
        subcategoriesByName
    };
}

function getDuplicates(rows) {
    const byCode = new Map();
    const duplicateCodes = [];
    rows.forEach(row => {
        if (!row.external_code) return;
        const key = row.external_code;
        if (!byCode.has(key)) byCode.set(key, []);
        byCode.get(key).push(row);
    });
    byCode.forEach((items, code) => {
        if (items.length > 1) duplicateCodes.push({ externalCode: code, ids: items.map(item => item.id) });
    });

    const duplicateSubcategoriesInsideParent = [];
    const subBySemanticKey = new Map();
    rows.filter(row => row.type === "subcategory").forEach(row => {
        const key = makeStructureKey(row.parent_id, row.name);
        if (!subBySemanticKey.has(key)) subBySemanticKey.set(key, []);
        subBySemanticKey.get(key).push(row);
    });
    subBySemanticKey.forEach(items => {
        if (items.length > 1) {
            duplicateSubcategoriesInsideParent.push({
                parentId: items[0].parent_id,
                parentName: items[0].parent_name,
                normalizedName: normalizeCatalogStructureName(items[0].name),
                ids: items.map(item => item.id)
            });
        }
    });

    const sameNamesAcrossCategories = [];
    const subByName = new Map();
    rows.filter(row => row.type === "subcategory").forEach(row => {
        const key = normalizeCatalogStructureName(row.name);
        if (!subByName.has(key)) subByName.set(key, []);
        subByName.get(key).push(row);
    });
    subByName.forEach((items, normalizedName) => {
        const parentIds = new Set(items.map(item => item.parent_id));
        if (parentIds.size > 1) {
            sameNamesAcrossCategories.push({
                normalizedName,
                parentCount: parentIds.size,
                ids: items.map(item => item.id)
            });
        }
    });

    return {
        duplicateCodes,
        duplicateSubcategoriesInsideParent,
        sameNamesAcrossCategories
    };
}

async function buildStructureCodePlan(parsed) {
    const structureRows = await loadStructureRows();
    const indexes = createIndexes(structureRows);
    const beforeTotals = {
        categories: indexes.categories.length,
        categoriesCoded: indexes.categories.filter(row => row.external_code).length,
        subcategories: indexes.subcategories.length,
        subcategoriesCoded: indexes.subcategories.filter(row => row.external_code).length
    };
    let nextCategoryNumber = Math.max(0, ...indexes.categories.map(row => getCodeNumber(row.external_code))) + 1;
    let nextSubcategoryNumber = Math.max(0, ...indexes.subcategories.map(row => getCodeNumber(row.external_code))) + 1;
    const plan = [];
    const diagnostics = [];
    const notFound = [];
    const ambiguous = [];
    const duplicateCodes = [];
    const matchedDbIds = new Map();
    const counters = {
        matchedExisting: 0,
        assignedFromExcel: 0,
        generatedForStructureOnly: 0,
        alreadyCoded: 0,
        notFound: 0,
        ambiguous: 0,
        duplicateCodes: 0,
        actualUpdatedRows: 0
    };

    parsed.categoryRows.forEach(row => {
        if (row.externalCode && !validateCategoryCode(row.externalCode)) duplicateCodes.push({ code: row.externalCode, rowNumber: row.rowNumber, type: "category", reason: "INVALID_CODE" });
        const found = findCategoryForExcel(row, indexes.categoriesByCode, indexes.categoriesByName);
        if (found.ambiguous) {
            ambiguous.push({ type: "category", excel: row, candidates: found.ambiguous.map(toPublicRow) });
            counters.ambiguous += 1;
            return;
        }
        if (!found.row) {
            notFound.push({ type: "category", excel: row });
            counters.notFound += 1;
            return;
        }

        matchedDbIds.set(found.row.id, (matchedDbIds.get(found.row.id) || 0) + 1);
        counters.matchedExisting += 1;
        const nextCode = found.row.external_code || row.externalCode || formatCategoryCode(nextCategoryNumber++);
        if (found.row.external_code) {
            counters.alreadyCoded += 1;
            return;
        }
        if (pushUpdate(plan, found.row, nextCode, row.externalCode ? "assignedFromExcel" : "assignedFromExcelGenerated", { rowNumber: row.rowNumber })) {
            counters.assignedFromExcel += 1;
        }
    });

    parsed.subcategoryRows.forEach(row => {
        if (row.externalCode && !validateSubcategoryCode(row.externalCode)) duplicateCodes.push({ code: row.externalCode, rowNumber: row.rowNumber, type: "subcategory", reason: "INVALID_CODE" });
        const parent = row.categoryExternalCode
            ? indexes.categoriesByCode.get(normalizeCategoryCode(row.categoryExternalCode))
            : (indexes.categoriesByName.get(normalizeCatalogStructureName(row.category)) || [])[0];
        const { candidates, method } = getSubcategoryCandidates(row, parent, indexes.subcategoriesByCode, indexes.subcategoriesByParentAndName, indexes.subcategoriesByName);

        if (!candidates.length) {
            notFound.push({ type: "subcategory", excel: row, parent: parent ? toPublicRow(parent) : null, method });
            counters.notFound += 1;
            return;
        }

        const canonical = chooseCanonical(candidates);
        if (!canonical) {
            ambiguous.push({ type: "subcategory", excel: row, candidates: candidates.map(toPublicRow), method });
            counters.ambiguous += 1;
            return;
        }

        matchedDbIds.set(canonical.id, (matchedDbIds.get(canonical.id) || 0) + 1);
        counters.matchedExisting += 1;
        const donor = candidates.find(candidate => candidate.id !== canonical.id && candidate.external_code);
        const nextCode = canonical.external_code || row.externalCode || donor?.external_code || formatSubcategoryCode(nextSubcategoryNumber++);

        diagnostics.push({
            type: "subcategory",
            rowNumber: row.rowNumber,
            columnA: `Подкатегория - ${row.name}`,
            columnK: row.externalCode,
            category: row.category,
            categoryExternalCode: row.categoryExternalCode,
            method,
            candidateIds: candidates.map(candidate => candidate.id),
            selectedId: canonical.id,
            selectedHadCode: Boolean(canonical.external_code),
            donorId: donor?.id || null,
            reason: canonical.external_code ? "already coded" : donor ? "matched duplicate donor code" : row.externalCode ? "matched Excel code" : "Excel row has empty K; generated next SUB"
        });

        if (canonical.external_code) {
            counters.alreadyCoded += 1;
            return;
        }

        if (pushUpdate(plan, canonical, nextCode, row.externalCode || donor ? "assignedFromExcel" : "assignedFromExcelGenerated", { rowNumber: row.rowNumber, donorId: donor?.id || null })) {
            counters.assignedFromExcel += 1;
        }

        if (donor && donor.external_code === nextCode) {
            const donorNextCode = formatSubcategoryCode(nextSubcategoryNumber++);
            if (pushUpdate(plan, donor, donorNextCode, "generatedForStructureOnly", { replacesDonorForId: canonical.id })) {
                counters.generatedForStructureOnly += 1;
            }
        }
    });

    indexes.subcategories.forEach(row => {
        if (row.external_code) return;
        if (matchedDbIds.has(row.id)) return;
        const nextCode = formatSubcategoryCode(nextSubcategoryNumber++);
        if (pushUpdate(plan, row, nextCode, "generatedForStructureOnly")) {
            counters.generatedForStructureOnly += 1;
        }
    });

    indexes.categories.forEach(row => {
        if (row.external_code) return;
        if (matchedDbIds.has(row.id)) return;
        const nextCode = formatCategoryCode(nextCategoryNumber++);
        if (pushUpdate(plan, row, nextCode, "generatedForStructureOnly")) {
            counters.generatedForStructureOnly += 1;
        }
    });

    const repeatedMatches = Array.from(matchedDbIds.entries())
        .filter(([, count]) => count > 1)
        .map(([id, count]) => ({ id, count }));
    const futureCodes = new Map();
    const finalRows = structureRows.map(row => {
        const update = plan.find(item => Number(item.id) === Number(row.id));
        return { ...row, external_code: update ? update.newCode : row.external_code };
    });
    finalRows.forEach(row => {
        if (!row.external_code) return;
        if (!futureCodes.has(row.external_code)) futureCodes.set(row.external_code, []);
        futureCodes.get(row.external_code).push(row.id);
    });
    futureCodes.forEach((ids, code) => {
        if (ids.length > 1) duplicateCodes.push({ code, ids, reason: "FUTURE_DUPLICATE" });
    });
    counters.notFound = notFound.length;
    counters.ambiguous = ambiguous.length;
    counters.duplicateCodes = duplicateCodes.length;
    counters.actualUpdatedRows = plan.length;

    return {
        plan,
        counters,
        diagnostics,
        notFound,
        ambiguous,
        repeatedMatches,
        duplicates: getDuplicates(structureRows),
        duplicateCodes,
        beforeTotals
    };
}

async function applyPlan(plan) {
    const orderedPlan = plan.slice().sort((first, second) => {
        const firstReleasesCode = first.replacesDonorForId ? 0 : 1;
        const secondReleasesCode = second.replacesDonorForId ? 0 : 1;
        return firstReleasesCode - secondReleasesCode;
    });

    for (const item of orderedPlan) {
        await run(
            "UPDATE catalog_structure SET external_code = ?, updated_at = ? WHERE id = ?",
            [item.newCode, new Date().toISOString(), item.id]
        );
    }
}

async function migrateStructureCodes(excelPath) {
    const absoluteExcelPath = path.resolve(excelPath || "");
    if (!excelPath || !fs.existsSync(absoluteExcelPath)) {
        throw new Error('Usage: npm run catalog:migrate-structure-codes -- "C:\\path\\catalog.xlsx"');
    }
    if (!absoluteExcelPath.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Excel file must be .xlsx.");
    }

    await initDatabase();
    const parsed = await parseCatalogExcel(absoluteExcelPath);
    const criticalErrors = (parsed.errors || []).filter(error => error.severity === "critical");
    if (criticalErrors.length) {
        throw new Error(`Excel has critical errors: ${criticalErrors.slice(0, 5).map(error => error.code).join(", ")}`);
    }

    const planReport = await buildStructureCodePlan(parsed);
    if (planReport.duplicateCodes.length || planReport.ambiguous.length) {
        return {
            success: false,
            blocked: true,
            reason: "Conflicts detected before update.",
            sheetName: parsed.sheetName,
            categoryRows: parsed.categoryRows.length,
            subcategoryRows: parsed.subcategoryRows.length,
            ...planReport
        };
    }

    const backupPath = createBackup();
    await run("BEGIN IMMEDIATE TRANSACTION");
    try {
        await applyPlan(planReport.plan);
        await run("COMMIT");
    } catch (error) {
        await run("ROLLBACK").catch(() => {});
        throw error;
    }

    const afterRows = await loadStructureRows();
    const afterDuplicates = getDuplicates(afterRows);
    const integrity = await get("PRAGMA integrity_check");
    const foreignKeys = await all("PRAGMA foreign_key_check");
    const categoryTotal = afterRows.filter(row => row.type === "category").length;
    const subcategoryTotal = afterRows.filter(row => row.type === "subcategory").length;
    const categoryCoded = afterRows.filter(row => row.type === "category" && row.external_code).length;
    const subcategoryCoded = afterRows.filter(row => row.type === "subcategory" && row.external_code).length;

    return {
        success: true,
        backupPath,
        sheetName: parsed.sheetName,
        categoryRows: parsed.categoryRows.length,
        subcategoryRows: parsed.subcategoryRows.length,
        counters: planReport.counters,
        plan: planReport.plan,
        diagnostics: planReport.diagnostics,
        notFound: planReport.notFound,
        ambiguous: planReport.ambiguous,
        repeatedMatches: planReport.repeatedMatches,
        duplicateCodes: afterDuplicates.duplicateCodes,
        duplicateSubcategoriesInsideParent: afterDuplicates.duplicateSubcategoriesInsideParent,
        sameNamesAcrossCategories: afterDuplicates.sameNamesAcrossCategories,
        before: planReport.beforeTotals,
        after: {
            categories: categoryTotal,
            categoriesCoded: categoryCoded,
            subcategories: subcategoryTotal,
            subcategoriesCoded: subcategoryCoded
        },
        integrity: integrity?.integrity_check || "",
        foreignKeyIssues: foreignKeys.length
    };
}

async function main() {
    try {
        const report = await migrateStructureCodes(process.argv[2]);
        console.log(JSON.stringify(report, null, 2));
        if (!report.success || report.integrity !== "ok" || report.foreignKeyIssues || report.duplicateCodes?.length) {
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
    migrateStructureCodes,
    buildStructureCodePlan
};
