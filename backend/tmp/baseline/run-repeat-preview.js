const fs = require("fs");
const path = require("path");

const db = require("../../database");
const catalogImport = require("../../services/catalogImport");

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
    const buffer = fs.readFileSync(path.join(__dirname, "baseline-catalog.xlsx"));
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

    console.log(JSON.stringify({
        canImport: preview.canImport,
        summary: {
            new: preview.summary.new,
            updated: preview.summary.updated,
            unchanged: preview.summary.unchanged,
            requiresReview: preview.summary.requiresReview,
            matConflicts: preview.summary.matConflicts,
            unresolvedReviewConflicts: preview.summary.unresolvedReviewConflicts,
            priceChanged: preview.summary.priceChanged,
            priceIncreased: preview.summary.priceIncreased,
            priceDecreased: preview.summary.priceDecreased,
            matChangesPlanned: preview.summary.matChangesPlanned,
            criticalErrors: preview.summary.criticalErrors
        },
        counts: await getCounts(),
        review: preview.changes.requiresReview.map(item => ({
            row: item.rowNumber,
            mat: item.externalId,
            title: item.title,
            reason: item.reviewReason
        })),
        firstUpdated: preview.changes.updated.slice(0, 3).map(item => ({
            row: item.rowNumber,
            mat: item.externalId,
            title: item.title,
            changes: item.changes
        }))
    }, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
