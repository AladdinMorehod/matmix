const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/plasters-core-content");

const CONFIRM = "BACKFILL_PLASTER_CORE";
const ALL_MATS = Object.freeze(DATA.PRODUCTS.map(p => p.externalId));
const LIMITS = Object.freeze({ short_description: 2000, full_description: 12000 });
const MASS_LABELS = new Set(["вес", "масса", "вес упаковки", "масса упаковки", "фасовка"]);
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const normalize = value => String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const placeholder = value => /\b(?:NEEDS_SOURCE|UNKNOWN)\b/i.test(String(value || ""));

function openDatabase(file, writable = false) {
    if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(path.resolve(file), mode, error => {
            if (error) return reject(error);
            const db = {
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (e, row) => e ? rej(e) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (e, rows) => e ? rej(e) : res(rows))); },
                close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
        });
    });
}

function parseArgs(args) {
    const out = { apply: false };
    const seen = new Set();
    for (let i = 0; i < args.length; i++) {
        const [key, ...tail] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${key}`); out.apply = key === "--apply"; continue; }
        if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        out[key.slice(2)] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
    if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
    if (out.only !== undefined) { out.only = out.only.split(",").map(v => v.trim()).filter(Boolean); if (!out.only.length) throw new Error("Nonempty --only is required"); }
    else throw new Error("Explicit --only is required");
    return out;
}

async function loadState(db, externalId) {
    const product = await db.get("SELECT * FROM products WHERE external_id=?", [externalId]);
    if (!product || product.deleted_at) throw new Error(`Product missing or deleted: ${externalId}`);
    const values = await db.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active
        FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
        WHERE v.product_id=? ORDER BY v.id`, [product.id]);
    const definitions = await db.all("SELECT * FROM product_attribute_definitions WHERE is_active=1 ORDER BY id");
    return { product, values, definitions };
}

function findDefinition(definitions, code, label) {
    const exact = definitions.filter(d => d.code === code);
    if (exact.length > 1) throw new Error(`Ambiguous definition: ${code}`);
    if (exact.length) return exact[0];
    return definitions.find(d => normalize(d.label) === normalize(label) || (code === "package_weight" && MASS_LABELS.has(normalize(d.label)))) || null;
}
function valueOf(row) { return row.value_text ?? row.value_number ?? row.value_boolean; }
function canonicalConsumption(value) { return String(value ?? "").replace(/кг\s*\/\s*м²/gi, "").replace(/\s+при\s+слое.*$/i, "").replace(/\./g, ",").replace(/\s+/g, " ").trim().toLowerCase(); }
function sameValue(row, proposal, code = "") { if (!row) return false; const current = valueOf(row); if (code === "consumption_10mm") return canonicalConsumption(current) === canonicalConsumption(proposal.value); return String(current) === String(proposal.value) && ((proposal.value === null) === (current === null)); }

async function planProduct(db, config) {
    const state = await loadState(db, config.externalId);
    const { product, values, definitions } = state;
    if (product.title !== config.expectedTitle) throw new Error(`Identity mismatch: expected exact title "${config.expectedTitle}"`);
    if (values.some(v => !v.code)) throw new Error("Orphan attribute value");
    const byCode = new Map();
    for (const v of values) {
        const key = v.code || normalize(v.label);
        if (byCode.has(key)) throw new Error(`Duplicate semantic specifications: ${key}`);
        byCode.set(key, v);
    }
    const row = { externalId: config.externalId, title: product.title, productId: product.id, statuses: {}, current: { brand: product.brand, description: product.full_description || product.short_description || product.description || null, specsCount: values.length }, sourceKeys: config.sourceKeys, contentSources: config.contentSources, identityStatus: config.identityStatus, notes: [] };
    const brandDef = findDefinition(definitions, "brand", "Бренд");
    if (config.brand && (!brandDef || brandDef.data_type !== "text")) throw new Error("Missing or incompatible canonical brand definition");
    const existingBrand = byCode.get("brand") || values.find(v => normalize(v.label) === "бренд");
    if (!config.brand) row.brand = { status: "BLOCKED_IDENTITY", value: null };
    else row.brand = existingBrand && sameValue(existingBrand, { value: config.brand }) && String(product.brand || "") === config.brand ? { status: "EXISTING_OK", value: config.brand, currentValue: config.brand, currentProductBrand: product.brand, currentCode: existingBrand.code, currentId: existingBrand.id } : { status: config.allowCore !== false ? (existingBrand || product.brand ? "WILL_FIX" : "WILL_ADD") : "EXISTING_OK", value: config.brand, currentValue: existingBrand ? valueOf(existingBrand) : null, currentProductBrand: product.brand, currentCode: existingBrand?.code, currentId: existingBrand?.id, definitionId: brandDef?.id };
    row.specs = [];
    for (const code of DATA.CORE_ORDER.filter(c => c !== "brand")) {
        const proposal = config.core[code];
        const definition = findDefinition(definitions, code, code === "package_weight" ? "Фасовка" : code);
        const existing = values.find(v => v.code === code || (definition && v.attribute_definition_id === definition.id) || (code === "package_weight" && MASS_LABELS.has(normalize(v.label))));
        if (values.filter(v => v.code === code || (definition && v.attribute_definition_id === definition.id) || (code === "package_weight" && MASS_LABELS.has(normalize(v.label)))).length > 1) throw new Error(`Duplicate semantic specifications: ${code}`);
        const expectedType = typeof proposal.value === "number" ? "number" : "text";
        const compatibleConsumptionMigration = code === "consumption_10mm" && ["number", "text"].includes(definition?.data_type);
        if (proposal.status === "READY" && (!definition || (definition.data_type !== expectedType && !compatibleConsumptionMigration) || (code === "package_weight" && (definition.default_unit || "") !== "кг") || (code === "consumption_10mm" && (definition.default_unit || "") !== "кг/м²"))) throw new Error(`Incompatible definition: ${code}`);
        const item = { code, value: proposal.value, displayValue: proposal.value, sourceStatus: proposal.status, sources: proposal.sources || [], reason: proposal.reason, formula: proposal.formula, qualifier: proposal.qualifier, rawSourceValue: proposal.rawSourceValue, derived: Boolean(proposal.derived), definitionId: definition?.id, definitionType: definition?.data_type, currentValue: existing ? valueOf(existing) : null, currentCode: existing?.code, currentId: existing?.id };
        if (proposal.status === "ABSENT_BY_DESIGN") item.status = existing ? "EXISTING_OK" : "ABSENT_BY_DESIGN";
        else if (config.allowCore === false && proposal.status === "READY") item.status = "EXISTING_OK";
        else if (!definition && proposal.status === "READY") item.status = "ERROR";
        else if (existing && proposal.status === "READY" && sameValue(existing, proposal, code)) item.status = "EXISTING_OK";
        else if (existing && proposal.status === "READY") item.status = config.allowCore === false ? "EXISTING_OK" : "WILL_FIX";
        else if (!existing && proposal.status === "READY") item.status = "WILL_ADD";
        else item.status = proposal.status;
        row.specs.push(item);
    }
    const content = config.content;
    row.content = {};
    for (const field of ["full_description"]) {
        const proposed = content?.[field];
        if (!proposed) { row.content[field] = nonempty(product[field]) || (field === "full_description" && nonempty(product.description)) ? { status: "EXISTING_OK", value: product[field] || product.description } : { status: "NEEDS_SOURCE", reason: "Product-specific description is not available." }; continue; }
        if (!config.overwriteDescription && config.protectedContent) { row.content[field] = { status: "EXISTING_OK", value: product[field] || product.description || null, reason: "Protected product: content is reference-only; this task may add only allowlisted core fields." }; continue; }
        const existing = nonempty(product[field]) ? product[field] : null;
        row.content[field] = existing && existing === proposed ? { status: "EXISTING_OK", value: existing } : config.overwriteDescription ? { status: existing ? "WILL_FIX" : "WILL_ADD", value: proposed, currentValue: existing } : { status: existing ? "EXISTING_OK" : "NEEDS_SOURCE", value: proposed, currentValue: existing, reason: "Description overwrite is not allowlisted." };
    }
    row.status = config.identityStatus === "BLOCKED_IDENTITY" ? "BLOCKED_IDENTITY" : (row.specs.some(s => s.status === "NEEDS_SOURCE") || Object.values(row.content).some(c => c.status === "NEEDS_SOURCE") ? "PARTIAL" : "READY");
    row.summary = { ready: row.specs.filter(s => ["WILL_ADD", "WILL_FIX", "EXISTING_OK"].includes(s.status)).length, willAdd: row.specs.filter(s => s.status === "WILL_ADD").length, willFix: row.specs.filter(s => s.status === "WILL_FIX").length, needsSource: row.specs.filter(s => s.status === "NEEDS_SOURCE").length, absentByDesign: row.specs.filter(s => s.status === "ABSENT_BY_DESIGN").length };
    return row;
}

async function inspectBatch(db, { only, data = DATA } = {}) {
    const selected = [...new Set(only || [])];
    if (!selected.length) throw new Error("Explicit nonempty --only is required");
    const rows = [];
    for (const id of selected) {
        const config = data.PRODUCTS.find(p => p.externalId === id);
        if (!config) { rows.push({ externalId: id, status: "ERROR", error: `Unknown MAT: ${id}` }); continue; }
        try { rows.push(await planProduct(db, config)); } catch (error) { rows.push({ externalId: id, status: "ERROR", error: error.message }); }
    }
    const summary = { total: rows.length, ready: rows.filter(r => r.status === "READY").length, partial: rows.filter(r => r.status === "PARTIAL").length, blocked: rows.filter(r => r.status === "BLOCKED_IDENTITY").length, errors: rows.filter(r => r.status === "ERROR").length, needsSource: rows.reduce((n,r) => n + (r.summary?.needsSource || 0), 0) };
    const consumptionDefinition = await db.get("SELECT code,data_type,default_unit FROM product_attribute_definitions WHERE code='consumption_10mm'");
    return { mode: "dry-run", rows, summary, schema: { consumption_10mm: { currentDataType: consumptionDefinition?.data_type || null, proposedDataType: "text", unit: consumptionDefinition?.default_unit || "кг/м²", migration: "Existing numeric values are copied to value_text with comma decimal display, value_number is cleared, and the canonical definition is changed to text during explicit apply." } }, sources: data.SOURCES };
}

async function backupDatabase(dbPath, backupDir) {
    const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups"));
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `matmix-before-plaster-core-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    fs.copyFileSync(path.resolve(dbPath), target);
    return target;
}
async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires explicit confirmation: ${CONFIRM}`);
    const preflight = await inspectBatch(db, { only: options.only, data });
    if (preflight.summary.errors) throw new Error(`Batch preflight errors: ${preflight.rows.filter(r => r.error).map(r => `${r.externalId}: ${r.error}`).join("; ")}`);
    const backup = await backupDatabase(dbPath, options.backupDir);
    await db.run("BEGIN IMMEDIATE");
    let writes = 0;
    try {
        const now = new Date().toISOString();
        const shouldMigrate = preflight.rows.some(row => row.status !== "BLOCKED_IDENTITY" && row.specs?.some(item => ["WILL_ADD", "WILL_FIX"].includes(item.status)));
        const consumptionDefinition = await db.get("SELECT * FROM product_attribute_definitions WHERE code='consumption_10mm'");
        if (!consumptionDefinition) throw new Error("Missing canonical consumption_10mm definition");
        if (shouldMigrate && consumptionDefinition.data_type === "number") {
            const numericRows = await db.all("SELECT id,value_number FROM product_attribute_values WHERE attribute_definition_id=? AND value_number IS NOT NULL AND value_text IS NULL", [consumptionDefinition.id]);
            for (const item of numericRows) await db.run("UPDATE product_attribute_values SET value_text=?,value_number=NULL,unit_override='кг/м²',updated_at=? WHERE id=?", [String(item.value_number).replace(".", ","), now, item.id]);
            await db.run("UPDATE product_attribute_definitions SET data_type='text',updated_at=? WHERE id=? AND data_type='number'", [now, consumptionDefinition.id]);
            writes += numericRows.length + 1;
        } else if (shouldMigrate && consumptionDefinition.data_type !== "text") throw new Error("Incompatible consumption_10mm definition type");
        for (const row of preflight.rows) {
            if (row.status === "BLOCKED_IDENTITY") continue;
            const brand = row.brand;
            if (brand.status === "EXISTING_OK" && brand.currentId) await db.run("UPDATE product_attribute_values SET sort_order=0 WHERE id=? AND sort_order<>0", [brand.currentId]);
            if (brand.status === "WILL_ADD" || brand.status === "WILL_FIX") {
                await db.run("UPDATE products SET brand=?,updated_at=? WHERE id=? AND external_id=?", [brand.value, now, row.productId, row.externalId]); writes++;
                const def = brand.definitionId;
                if (!def) throw new Error("Missing canonical brand definition");
                if (brand.currentId) await db.run("UPDATE product_attribute_values SET value_text=?,value_number=NULL,value_boolean=NULL,unit_override=NULL,updated_at=? WHERE id=?", [brand.value, now, brand.currentId]);
                else { await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, def, brand.value, null, null, null, DATA.CORE_ORDER.indexOf("brand"), now, now]); writes++; }
            }
            for (const item of row.specs) {
                if (item.status === "EXISTING_OK" && item.currentId) { await db.run("UPDATE product_attribute_values SET sort_order=? WHERE id=? AND sort_order<>?", [DATA.CORE_ORDER.indexOf(item.code), item.currentId, DATA.CORE_ORDER.indexOf(item.code)]); continue; }
                if (!["WILL_ADD", "WILL_FIX"].includes(item.status)) continue;
                if (placeholder(item.value)) throw new Error(`Placeholder write forbidden: ${row.externalId}/${item.code}`);
                const def = item.definitionId; if (!def) throw new Error(`Missing definition: ${item.code}`);
                const type = typeof item.value === "number" ? "number" : "text";
                const existing = row.currentValues?.[item.code];
                if (item.currentCode || item.currentValue !== null) {
                    const current = await db.get("SELECT v.id FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? AND (d.code=? OR (?='package_weight' AND lower(replace(replace(d.label,'ё','е'),' ','')) IN ('вес','масса','весупаковки','массаупаковки','фасовка')))", [row.productId, item.code, item.code]);
                    if (!current) throw new Error(`Existing value disappeared: ${item.code}`);
                    await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=NULL,unit_override=?,sort_order=?,updated_at=? WHERE id=?", [type === "text" ? item.value : null, type === "number" ? item.value : null, type === "number" ? (item.code === "package_weight" ? "кг" : "кг/м²") : null, DATA.CORE_ORDER.indexOf(item.code), now, current.id]);
                } else await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,NULL,?,?,?,?)", [row.productId, def, type === "text" ? item.value : null, type === "number" ? item.value : null, item.code === "package_weight" ? "кг" : item.code === "consumption_10mm" ? "кг/м²" : null, DATA.CORE_ORDER.indexOf(item.code), now, now]);
                writes++;
            }
            for (const [field, item] of Object.entries(row.content)) if (["WILL_ADD", "WILL_FIX"].includes(item.status)) { await db.run(`UPDATE products SET ${field}=?,updated_at=? WHERE id=? AND external_id=?`, [item.value, now, row.productId, row.externalId]); writes++; }
        }
        const post = await inspectBatch(db, { only: options.only, data });
        if (post.summary.errors || post.rows.some(r => r.status === "READY" && r.specs.some(s => s.status === "WILL_ADD" || s.status === "WILL_FIX"))) throw new Error("Postcheck failed");
        await db.run("COMMIT");
        return { ...post, mode: "apply", writes, backup };
    } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function renderReview(report) {
    const lines = ["# Corrective backfill штукатурок — review", "", `Режим: ${report.mode}. БД рассматривается как локальный снимок, не production truth.`, "", "| MAT | Brand | Type | Base | Purpose | Package | Consumption 10mm | Wall layer | Ceiling layer | Temperature | Description | Status |", "|---|---|---|---|---|---:|---:|---|---|---|---|---|"];
    for (const row of report.rows) { const spec = code => row.specs?.find(s => s.code === code); const val = code => { const s = code === "brand" ? row.brand : spec(code); if (!s) return "—"; const value = s.value ?? s.currentValue; return `${value ?? "—"} (${s.status || "—"})`; }; lines.push(`| ${row.externalId} | ${val("brand")} | ${val("product_type")} | ${val("base")} | ${val("purpose")} | ${val("package_weight")} | ${val("consumption_10mm")} | ${val("wall_layer_thickness")} | ${val("ceiling_layer_thickness")} | ${val("application_temperature")} | ${row.content?.full_description?.status || "—"} | ${row.status} |`); }
    const schema = report.schema?.consumption_10mm;
    if (schema) lines.push("", "## Schema migration plan", "", `- canonical **consumption_10mm**: ${schema.currentDataType || "missing"} → **${schema.proposedDataType}**; unit: ${schema.unit}.`, `- ${schema.migration}`);
    lines.push("", "## Consumption provenance", "", "| MAT | exact display | source raw value | derived | formula | sources |", "|---|---|---|---|---|---|");
    for (const row of report.rows) { const s = row.specs?.find(item => item.code === "consumption_10mm"); if (!s) continue; const formula = String(s.formula || "").replace(/\|/g, "\\|").replace(/\n/g, " "); const raw = String(s.rawSourceValue ?? "—").replace(/\|/g, "\\|"); lines.push(`| ${row.externalId} | ${s.displayValue ?? s.value ?? "—"} | ${raw} | ${s.derived ? "yes" : "no"} | ${formula || "—"} | ${(s.sources || []).join(", ") || "—"} |`); }
    lines.push("", "## NEEDS_SOURCE / BLOCKED_IDENTITY", "");
    for (const row of report.rows.filter(r => r.status === "PARTIAL" || r.status === "BLOCKED_IDENTITY")) { lines.push(`### ${row.externalId}`, "", `- Источники: ${(row.sourceKeys || []).map(k => report.sources[k]?.url ? `${k} (${report.sources[k].url})` : k).join(", ") || "не установлены"}.`); for (const s of row.specs || []) if (s.status === "NEEDS_SOURCE") lines.push(`- ${s.code}: ${s.reason || "нужен официальный источник"}`); if (row.status === "BLOCKED_IDENTITY") lines.push("- Точная identity не доказана; запись запрещена."); }
    lines.push("", "## Source registry", "");
    for (const [key, item] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${item.url ? `[${item.title || key}](${item.url})` : (item.title || key)}${item.note ? ` — ${item.note}` : ""}`);
    return lines.join("\n") + "\n";
}

async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); if (options.review) { fs.mkdirSync(path.dirname(path.resolve(options.review)), { recursive: true }); fs.writeFileSync(`${options.review}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${options.review}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ summary: report.summary, mode: report.mode })); if (report.summary.errors) process.exitCode = 1; } finally { await db.close(); } }
module.exports = { ALL_MATS, CONFIRM, DATA, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview };
if (require.main === module) main().catch(e => { console.error(`BACKFILL ABORTED: ${e.message}`); process.exitCode = 1; });
