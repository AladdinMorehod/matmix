const fs = require("fs");
const path = require("path");

const db = require("../../database");
const catalogImport = require("../../services/catalogImport");

const excelPath = path.join(__dirname, "baseline-catalog.xlsx");

async function getCounts() {
    const [products, structure, duplicateMatRows, duplicateStructureCodeRows] = await Promise.all([
        db.get("SELECT COUNT(*) AS count FROM products"),
        db.get("SELECT COUNT(*) AS count FROM catalog_structure"),
        db.all(`
            SELECT external_id, COUNT(*) AS count
            FROM products
            WHERE external_id LIKE 'MAT-%'
              AND deleted_at IS NULL
            GROUP BY external_id
            HAVING COUNT(*) > 1
        `),
        db.all(`
            SELECT external_code, COUNT(*) AS count
            FROM catalog_structure
            WHERE external_code IS NOT NULL
              AND external_code != ''
            GROUP BY external_code
            HAVING COUNT(*) > 1
        `)
    ]);

    return {
        products: Number(products.count || 0),
        structure: Number(structure.count || 0),
        duplicateMat: duplicateMatRows.length,
        duplicateStructureCodes: duplicateStructureCodeRows.length
    };
}

async function main() {
    await db.initDatabase();

    const before = await getCounts();
    const buffer = fs.readFileSync(excelPath);
    const parsed = await catalogImport.parseCatalogExcel(buffer);
    const preview = await catalogImport.createCatalogImportPreviewToken(
        db,
        parsed,
        {
            name: "baseline-catalog.xlsx",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },
        { id: 1, name: "Codex Test" },
        buffer
    );
    const dryRun = await catalogImport.getCatalogImportGroupResolutionDryRun(
        db,
        preview.token,
        { strategy: "accept_excel_mat" },
        { id: 1 }
    );
    const excludes = dryRun.data.blocked.map(item => ({
        rowId: item.rowId,
        action: "exclude"
    }));
    const saved = await catalogImport.updateCatalogImportResolutions(
        db,
        preview.token,
        [...dryRun.data.resolutions, ...excludes],
        { id: 1 }
    );
    const afterResolution = saved.data.preview.summary;
    const applied = await catalogImport.applyCatalogImport(
        db,
        preview.token,
        {},
        { id: 1, name: "Codex Test" }
    );
    const after = await getCounts();

    console.log(JSON.stringify({
        parsed: {
            productRows: parsed.productRows.length,
            categoryRows: parsed.categoryRows.length,
            subcategoryRows: parsed.subcategoryRows.length,
            errors: parsed.errors.length,
            warnings: parsed.warnings.length
        },
        before,
        dryRun: {
            totalConflicts: dryRun.data.totalConflicts,
            eligibleRows: dryRun.data.eligibleRows,
            blockedRows: dryRun.data.blockedRows,
            matChangesPlanned: dryRun.data.matChangesPlanned,
            uniqueProducts: dryRun.data.uniqueProducts,
            duplicateProductConflicts: dryRun.data.duplicateProductConflicts,
            duplicateMatConflicts: dryRun.data.duplicateMatConflicts,
            blockedReasonCounts: dryRun.data.blockedReasonCounts,
            blocked: dryRun.data.blocked.map(item => ({
                rowNumber: item.rowNumber,
                mat: item.excelMat,
                title: item.titleExcel,
                reasons: item.blockReasons
            }))
        },
        afterResolution: {
            canImport: saved.data.preview.canImport,
            updated: afterResolution.updated,
            new: afterResolution.new,
            unresolvedReviewConflicts: afterResolution.unresolvedReviewConflicts,
            resolvedReviewConflicts: afterResolution.resolvedReviewConflicts,
            matChangesPlanned: afterResolution.matChangesPlanned,
            excluded: afterResolution.excluded,
            blockingConflicts: afterResolution.blockingConflicts
        },
        applied: {
            created: applied.created,
            updated: applied.updated,
            assignedMat: applied.assignedMat,
            assignedStructureCodes: applied.assignedStructureCodes,
            requiresReview: applied.requiresReview,
            integrityCheck: applied.integrityCheck,
            excelCopyUrl: applied.excelCopyUrl
        },
        after
    }, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
