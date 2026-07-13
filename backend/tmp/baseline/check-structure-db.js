const db = require("../../database");

async function main() {
    await db.initDatabase();

    const integrity = await db.get("PRAGMA integrity_check");
    const duplicateCat = await db.all(`
        SELECT external_code, count(1) AS count
        FROM catalog_structure
        WHERE type = 'category'
          AND external_code IS NOT NULL
          AND length(external_code) > 0
        GROUP BY external_code
        HAVING count(1) > 1
    `);
    const duplicateSub = await db.all(`
        SELECT external_code, count(1) AS count
        FROM catalog_structure
        WHERE type = 'subcategory'
          AND external_code IS NOT NULL
          AND length(external_code) > 0
        GROUP BY external_code
        HAVING count(1) > 1
    `);
    const duplicateStructure = await db.all(`
        SELECT external_code, count(1) AS count
        FROM catalog_structure
        WHERE external_code IS NOT NULL
          AND length(external_code) > 0
        GROUP BY external_code
        HAVING count(1) > 1
    `);
    const subcategoriesWithoutParent = await db.all(`
        SELECT sub.id
        FROM catalog_structure sub
        LEFT JOIN catalog_structure cat
          ON cat.id = sub.parent_id
         AND cat.type = 'category'
        WHERE sub.type = 'subcategory'
          AND cat.id IS NULL
    `);

    console.log(JSON.stringify({
        integrityCheck: integrity.integrity_check,
        duplicateCatCodes: duplicateCat.length,
        duplicateSubCodes: duplicateSub.length,
        duplicateStructureCodes: duplicateStructure.length,
        subcategoriesWithoutParent: subcategoriesWithoutParent.length
    }, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
