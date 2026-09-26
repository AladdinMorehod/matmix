const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3");
const { resolve, getOrderingContext, MAIN_ATTRIBUTES } = require("../services/productAttributeOrder");

async function audit(file) {
    const hash = () => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    const beforeHash = hash();
    const connection = new sqlite3.Database(file, sqlite3.OPEN_READONLY);
    const database = {
        all: (sql, params = []) => new Promise((resolve, reject) => connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))),
        get: (sql, params = []) => new Promise((resolve, reject) => connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row)))
    };
    try {
        await database.all("BEGIN");
        const products = await database.all(`SELECT * FROM products WHERE deleted_at IS NULL AND
            (external_id BETWEEN 'MAT-000067' AND 'MAT-000090' OR external_id IN ('MAT-000001','MAT-000030','MAT-000050')) ORDER BY external_id`);
        const examples = [];
        for (const product of products) {
            const rows = await database.all(`SELECT v.*,d.code,d.label,d.data_type FROM product_attribute_values v
                JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=?
                ORDER BY v.sort_order,d.sort_order,d.label,d.id`, [product.id]);
            const context = await getOrderingContext(product, database);
            const values = rows.map(row => ({ definitionId: row.attribute_definition_id, code: row.code, label: row.label,
                value: row.data_type === "text" ? row.value_text : row.data_type === "number" ? row.value_number : row.value_boolean === null ? null : Boolean(row.value_boolean), sortOrder: row.sort_order }));
            const after = resolve({ ...context, values, brand: product.brand || "", includeEmptyMain: false });
            examples.push({ product: product.external_id, before: rows.map(row => row.code),
                main: MAIN_ATTRIBUTES.map(item => ({ code: item.code, value: item.code === "brand" ? product.brand || "" : values.find(value => value.code === item.code)?.value ?? "" })),
                regular: after.filter(item => !MAIN_ATTRIBUTES.some(main => main.code === item.code)).map(item => item.code),
                after: after.map(item => item.code),
                missingMainDefinitions: MAIN_ATTRIBUTES.filter(item => !context.definitions.some(row => row.code === item.code)).map(item => item.code),
                legacyBrandMismatch: rows.some(row => row.code === "brand" && String(row.value_text || "") !== String(product.brand || "")) });
        }
        await database.all("ROLLBACK");
        return { mode: "read-only", databaseUnchanged: beforeHash === hash(), sha256: beforeHash, products: examples };
    } finally { await new Promise((resolve, reject) => connection.close(error => error ? reject(error) : resolve())); }
}

if (require.main === module) audit(path.resolve(process.argv[2] || path.join(__dirname, "../database/matmix.db")))
    .then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { audit };
