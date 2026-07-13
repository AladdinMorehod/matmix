const fs = require("fs");
const path = require("path");

const db = require("../../database");
const catalogImport = require("../../services/catalogImport");

const excelPath = path.join(__dirname, "baseline-catalog.xlsx");

async function main() {
    await db.initDatabase();

    const buffer = fs.readFileSync(excelPath);
    const parsed = await catalogImport.parseCatalogExcel(buffer);
    const preview = await catalogImport.buildCatalogImportPreview(
        db,
        parsed,
        {
            name: "baseline-catalog.xlsx",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    );

    const summary = preview.summary || {};
    const changes = preview.changes || {};

    console.log(JSON.stringify({
        canImport: preview.canImport,
        parsed: {
            productRows: parsed.productRows.length,
            categoryRows: parsed.categoryRows.length,
            subcategoryRows: parsed.subcategoryRows.length,
            errors: parsed.errors.length,
            warnings: parsed.warnings.length
        },
        structure: {
            renamedCategories: summary.renamedCategories || 0,
            renamedSubcategories: summary.renamedSubcategories || 0,
            assignedCategoryCodes: summary.assignedCategoryCodes || 0,
            assignedSubcategoryCodes: summary.assignedSubcategoryCodes || 0,
            newCategories: summary.newCategories || 0,
            newSubcategories: summary.newSubcategories || 0,
            missingCategoryCodes: summary.missingCategoryCodes || 0,
            missingSubcategoryCodes: summary.missingSubcategoryCodes || 0,
            structureCodeConflicts: summary.structureCodeConflicts || 0,
            existingCategoriesMatchedByName: summary.existingCategoriesMatchedByName || 0,
            existingSubcategoriesMatchedByName: summary.existingSubcategoriesMatchedByName || 0,
            categoryCodesPreserved: summary.categoryCodesPreserved || 0,
            subcategoryCodesPreserved: summary.subcategoryCodesPreserved || 0,
            categoryCodesAssigned: summary.categoryCodesAssigned || 0,
            subcategoryCodesAssigned: summary.subcategoryCodesAssigned || 0,
            categoryExcelCodesIgnored: summary.categoryExcelCodesIgnored || 0,
            subcategoryExcelCodesIgnored: summary.subcategoryExcelCodesIgnored || 0,
            realStructureConflicts: summary.realStructureConflicts || 0,
            firstRenamedSubcategories: (changes.renamedSubcategories || []).slice(0, 10).map(item => ({
                externalCode: item.externalCode,
                currentName: item.currentName,
                incomingName: item.incomingName,
                rowNumber: item.rowNumber
            })),
            firstCodeConflicts: (changes.structureCodeConflicts || []).slice(0, 10).map(item => ({
                type: item.type,
                conflictType: item.conflictType,
                externalCode: item.externalCode,
                incomingName: item.incomingName,
                codeOwner: item.codeOwner?.name || "",
                nameMatch: item.nameMatch?.name || "",
                rowNumber: item.rowNumber
            }))
        },
        review: {
            requiresReview: summary.requiresReview || 0,
            matConflicts: summary.matConflicts || 0,
            unresolvedReviewConflicts: summary.unresolvedReviewConflicts || 0,
            criticalErrors: summary.criticalErrors || 0
        }
    }, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
