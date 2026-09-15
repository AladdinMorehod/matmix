const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const DATA = require("./data/plasters-content");

const PROTECTED = Object.freeze(["MAT-000002", "MAT-000005"]);
const ALL_MATS = Object.freeze(Array.from({ length: 28 }, (_, i) => `MAT-${String(i + 1).padStart(6, "0")}`));
const CONFIRM = "SEED_PLASTERS_CONTENT";
// Match productContent limits without importing ../database (which opens the app DB).
const LIMITS = Object.freeze({ full_description: 12000, seo_title: 160, seo_description: 320 });
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const placeholder = value => /\b(?:NEEDS_SOURCE|UNKNOWN)\b/i.test(String(value));
const normalizeLabel = value => String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const MASS_LABELS = new Set(["вес", "масса", "вес упаковки", "масса упаковки", "фасовка"]);

async function openDatabase(file, writable = false) {
    // A missing file is an error, never an empty new business database.
    const mode = file === ":memory:" ? sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE : writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    const raw = await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(file === ":memory:" ? file : path.resolve(file), mode, error => error ? reject(error) : resolve(db));
    });
    const db = {
        run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
        all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
        close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
    };
    try {
        await db.run("PRAGMA foreign_keys=ON");
        await db.run("PRAGMA busy_timeout=5000");
        if (!writable) await db.run("PRAGMA query_only=ON");
        return db;
    } catch (error) { await db.close(); throw error; }
}

function validateProposal(config, data) {
    if (!config || !ALL_MATS.includes(config.externalId) || PROTECTED.includes(config.externalId)) throw new Error("Invalid proposal MAT");
    if (!nonempty(config.expectedTitle)) throw new Error("Expected title required");
    if (Object.keys(config.content).sort().join() !== Object.keys(LIMITS).sort().join()) throw new Error("Only full_description and SEO fields are allowed");
    const validateEntry = entry => {
        if (!entry || !["READY", "NEEDS_SOURCE", "SKIP"].includes(entry.status)) throw new Error("Invalid source status");
        if (!Array.isArray(entry.sources) || entry.sources.some(source => !data.SOURCES[source])) throw new Error("Unknown source reference");
        if (entry.status === "READY" && (!entry.sources.length || !nonempty(entry.value) || placeholder(entry.value))) throw new Error("READY requires sourced non-placeholder value");
        if (config.draftOnly && entry.status === "READY") throw new Error("Unresolved product cannot contain READY proposals");
    };
    for (const [field, entry] of Object.entries(config.content)) {
        validateEntry(entry);
        if (typeof entry.value !== "string" || !entry.value.trim() || entry.value.length > LIMITS[field]) throw new Error(`Content limit/type: ${field}`);
    }
    for (const [code, entry] of Object.entries(config.attributes)) {
        if (!data.DEFINITIONS[code]) throw new Error(`Unknown attribute code: ${code}`);
        validateEntry(entry);
        if (entry.status !== "READY") continue;
        const [, type] = data.DEFINITIONS[code];
        if (type === "number" && (typeof entry.value !== "number" || !Number.isFinite(entry.value))) throw new Error(`Invalid number: ${code}`);
        if (type === "text" && (typeof entry.value !== "string" || entry.value.length > 2000)) throw new Error(`Attribute limit/type: ${code}`);
    }
}

function summarize(rows) {
    const summary = { total: rows.length, ready: 0, partial: 0, needsSource: 0, protected: 0, errors: 0 };
    const keys = { READY: "ready", PARTIAL: "partial", NEEDS_SOURCE: "needsSource", PROTECTED: "protected", ERROR: "errors" };
    for (const row of rows) summary[keys[row.status]]++;
    return summary;
}

async function inspectBatch(database, { only, data = DATA } = {}) {
    if (only !== undefined && (!Array.isArray(only) || !only.length)) throw new Error("Nonempty MAT array required");
    const selected = only === undefined ? ALL_MATS : [...new Set(only)];
    if (!Array.isArray(selected) || !selected.length) throw new Error("Empty MAT selection");
    const definitions = await database.all("SELECT * FROM product_attribute_definitions ORDER BY id");
    const results = [];
    for (const externalId of selected) {
        let row = { externalId, status: "ERROR", proposedContent: {}, proposedSpecs: [], notes: [] };
        try {
            if (!ALL_MATS.includes(externalId)) throw new Error(`Unknown MAT: ${externalId}`);
            const products = await database.all("SELECT * FROM products WHERE external_id=?", [externalId]);
            if (products.length !== 1 || products[0].deleted_at) throw new Error("Product missing, deleted or ambiguous");
            const product = products[0];
            const values = await database.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active
                FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
                WHERE v.product_id=? ORDER BY v.id`, [product.id]);
            const images = await database.all("SELECT * FROM product_images WHERE product_id=? ORDER BY id", [product.id]);
            row = { ...row, title: product.title, current: {
                description: nonempty(product.description) || nonempty(product.full_description) || nonempty(product.short_description),
                specsCount: values.length, seo: { title: nonempty(product.seo_title), description: nonempty(product.seo_description) },
                content: Object.fromEntries(["description", "short_description", ...Object.keys(LIMITS)].map(field => [field, product[field] ?? null])),
                attributes: values, imagesCount: images.length
            }, productId: product.id };
            if (PROTECTED.includes(externalId)) {
                row.status = "PROTECTED";
                row.notes = ["Полностью исключён из любых записей, даже если локальный контент отсутствует."];
                results.push(row);
                continue;
            }
            const configs = data.PRODUCTS.filter(item => item.externalId === externalId);
            if (configs.length !== 1) throw new Error("Proposal missing or duplicated");
            const config = configs[0];
            validateProposal(config, data);
            if (product.title !== config.expectedTitle) throw new Error(`Identity mismatch: title differs from reviewed title (${config.expectedTitle})`);
            if (values.some(value => !value.code)) throw new Error("Orphan attribute value");
            if (new Set(values.map(value => value.code)).size !== values.length) throw new Error("Duplicate specifications");
            row.notes = config.notes || [];
            row.classificationMismatches = config.classificationMismatches || "";
            for (const [field, proposal] of Object.entries(config.content)) {
                // Preserve the legacy fallback too: adding full_description would hide it.
                const existing = nonempty(product[field]) || (field === "full_description" && nonempty(product.description));
                row.proposedContent[field] = { ...proposal, status: existing ? "EXISTING" : proposal.status };
                if (field === "full_description" && !nonempty(product[field]) && nonempty(product.description)) row.proposedContent[field].reason = "Legacy description is displayed by the product page; preserve it";
            }
            for (const [code, proposal] of Object.entries(config.attributes)) {
                const [label, type, unit] = data.DEFINITIONS[code];
                const matches = definitions.filter(definition => definition.code === code);
                // Preserve a known semantic equivalent instead of adding a second
                // characteristic (especially Вес / Масса / Фасовка).
                const equivalents = values.filter(value => value.code === code || normalizeLabel(value.label) === normalizeLabel(label)
                    || (code === "package_weight" && MASS_LABELS.has(normalizeLabel(value.label))));
                if (equivalents.length > 1) throw new Error(`Duplicate semantic specifications: ${code}`);
                const existing = equivalents[0];
                const item = { code, label, type, unit, ...proposal };
                if (matches.length > 1) throw new Error(`Ambiguous definition: ${code}`);
                if (existing) {
                    item.status = "EXISTING";
                    item.currentValue = existing.value_text ?? existing.value_number ?? existing.value_boolean;
                    item.currentCode = existing.code;
                } else if (item.status === "READY") {
                    const definition = matches[0];
                    if (!definition) { item.status = "SKIP"; item.reason = "DEFINITION_MISSING: review-only; no definitions are created"; }
                    else if (definition.data_type !== type || (definition.default_unit || "") !== unit || Number(definition.is_active) !== 1) {
                        throw new Error(`Incompatible definition: ${code} (type, unit or active status)`);
                    } else item.definitionId = definition.id;
                }
                row.proposedSpecs.push(item);
            }
            const proposals = [...Object.values(row.proposedContent), ...row.proposedSpecs];
            const pending = proposals.some(item => ["NEEDS_SOURCE", "SKIP"].includes(item.status));
            const available = proposals.some(item => ["READY", "EXISTING"].includes(item.status));
            row.status = pending ? available ? "PARTIAL" : "NEEDS_SOURCE" : "READY";
            row.specs = {
                ready: row.proposedSpecs.filter(item => item.status === "READY").length,
                needsSource: row.proposedSpecs.filter(item => item.status === "NEEDS_SOURCE").length,
                existing: row.proposedSpecs.filter(item => item.status === "EXISTING").length,
                skipped: row.proposedSpecs.filter(item => item.status === "SKIP").length
            };
        } catch (error) { row.status = "ERROR"; row.error = error.message; }
        results.push(row);
    }
    return { mode: "dry-run", scope: "Explicit local DB snapshot; NOT production truth", rows: results, summary: summarize(results),
        targetSummary: summarize(results.filter(row => !PROTECTED.includes(row.externalId))), definitions };
}

async function runBatch({ database, only, apply = false, confirm = "", data = DATA } = {}) {
    if (!apply) return inspectBatch(database, { only, data });
    if (confirm !== CONFIRM) throw new Error(`Apply requires explicit confirmation: ${CONFIRM}`);
    // Recompute the plan while holding the write lock. Never apply a stale dry-run plan.
    await database.run("BEGIN IMMEDIATE");
    try {
        const plan = await inspectBatch(database, { only, data });
        if (plan.summary.errors) throw new Error(`Batch preflight errors: ${plan.rows.filter(row => row.error).map(row => `${row.externalId}: ${row.error}`).join("; ")}`);
        let fieldsWritten = 0; let specsInserted = 0;
        const now = new Date().toISOString();
        for (const row of plan.rows) {
            if (PROTECTED.includes(row.externalId) || row.status === "NEEDS_SOURCE") continue;
            for (const [field, proposal] of Object.entries(row.proposedContent)) {
                if (proposal.status !== "READY") continue;
                if (!Object.hasOwn(LIMITS, field) || placeholder(proposal.value)) throw new Error("Invalid write field/value");
                const result = await database.run(`UPDATE products SET ${field}=?,updated_at=?
                    WHERE id=? AND external_id=? AND deleted_at IS NULL AND (${field} IS NULL OR trim(${field})='')`,
                [proposal.value, now, row.productId, row.externalId]);
                if (result.changes !== 1) throw new Error("Content changed after preflight");
                fieldsWritten++;
            }
            for (const item of row.proposedSpecs) {
                if (item.status !== "READY") continue;
                if (placeholder(item.value)) throw new Error("Placeholder write forbidden");
                await database.run(`INSERT INTO product_attribute_values
                    (product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at)
                    VALUES(?,?,?,?,NULL,NULL,?,?,?)`, [row.productId, item.definitionId, item.type === "text" ? item.value : null,
                    item.type === "number" ? item.value : null, plan.definitions.find(d => d.id === item.definitionId).sort_order || 0, now, now]);
                specsInserted++;
            }
        }
        const after = await inspectBatch(database, { only, data });
        if (after.summary.errors || after.rows.some(row => Object.values(row.proposedContent).some(item => item.status === "READY") || row.proposedSpecs.some(item => item.status === "READY"))) throw new Error("Postcheck failed");
        await database.run("COMMIT");
        return { ...after, mode: "apply", fieldsWritten, specsInserted };
    } catch (error) {
        try { await database.run("ROLLBACK"); } catch (rollbackError) { throw new AggregateError([error, rollbackError], "Batch failed and rollback failed"); }
        throw error;
    }
}

function parseArgs(args) {
    const options = { apply: false };
    const seen = new Set();
    for (let i = 0; i < args.length; i++) {
        const [key, ...tail] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected value: ${key}`);
            options.apply = key === "--apply";
            continue;
        }
        if (!["--db", "--only", "--confirm", "--review"].includes(key)) throw new Error(`Unknown option: ${key}; overwrite is not supported`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        options[key.slice(2)] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either dry-run or apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing local database is required");
    if (options.only !== undefined) {
        options.only = options.only.split(",").map(value => value.trim());
        if (options.only.some(value => !value)) throw new Error("Empty --only selection item");
    }
    if (options.apply && options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (!options.apply && options.confirm) throw new Error("--confirm requires --apply");
    return options;
}

const cell = value => String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
function renderReview(report, data = DATA) {
    const out = ["# Штукатурки — review перед записью", "", `Снимок: ${report.generatedAt}. Режим: ${report.mode}.`, "",
        `БД: ${report.database}. **Это локальный снимок, не production truth.**`, "",
        "READY означает техническую готовность отдельного значения. SKIP — подтверждённое значение остаётся только в review (нет definition либо представления без потери смысла). NEEDS_SOURCE — не записывать. PROTECTED исключены целиком. Предлагаемые тексты показаны даже при EXISTING, но существующее значение сохраняется.", "",
        "## Summary", "", "```json", JSON.stringify({ summary: report.summary, targetSummary: report.targetSummary }, null, 2), "```", "",
        "| MAT | Точный локальный title | Description | Specs | SEO title/description | Предложение description | Specs READY / NEEDS_SOURCE / SKIP | Предложение SEO title/description | Итог |",
        "| --- | --- | --- | ---: | --- | --- | --- | --- | --- |"];
    for (const row of report.rows) out.push(`| ${row.externalId} | ${cell(row.title)} | ${row.current?.description ? "yes" : "no"} | ${row.current?.specsCount ?? "—"} | ${row.current?.seo.title ? "yes" : "no"}/${row.current?.seo.description ? "yes" : "no"} | ${row.proposedContent.full_description?.status || row.status} | ${row.specs ? `${row.specs.ready} / ${row.specs.needsSource} / ${row.specs.skipped}` : "—"} | ${row.proposedContent.seo_title?.status || row.status}/${row.proposedContent.seo_description?.status || row.status} | ${row.status} |`);
    for (const row of report.rows) {
        out.push("", `## ${row.externalId} — ${row.title || "ERROR"}`, "", `**${row.status}**`, "");
        if (row.error) out.push(`Ошибка: ${row.error}`, "");
        for (const note of row.notes) out.push(`- ${note}`);
        if (row.classificationMismatches) out.push("", `**Classification mismatch:** ${row.classificationMismatches}`);
        out.push("", "### Текущий локальный контент", "", "```json", JSON.stringify(row.current || null, null, 2), "```", "");
        if (row.status === "PROTECTED") continue;
        for (const [field, entry] of Object.entries(row.proposedContent)) {
            out.push(`### ${field} — ${entry.status} (${entry.value.length} символов)`, "", entry.value, "", `Источники: ${entry.sources.join(", ")}.`, "");
            if (entry.reason) out.push(entry.reason, "");
        }
        out.push("### Характеристики", "", "| Код / параметр | Предложение | Статус | Источники | Причина |", "| --- | --- | --- | --- | --- |");
        for (const item of row.proposedSpecs) out.push(`| ${item.code} / ${item.label} | ${cell(item.value)}${item.value !== null && item.type === "number" ? ` ${item.unit}` : ""} | ${item.status} | ${item.sources.join(", ")} | ${cell(item.reason || "")} |`);
        const skipped = row.proposedSpecs.filter(item => item.status === "SKIP");
        const unresolved = row.proposedSpecs.filter(item => item.status === "NEEDS_SOURCE");
        out.push("", "**Skipped fields:**", "", skipped.length ? skipped.map(item => `- ${item.code}: ${item.reason || "not writable in current schema"}`).join("\n") : "- нет");
        out.push("", "**NEEDS_SOURCE fields:**", "", unresolved.length ? unresolved.map(item => `- ${item.code}: ${item.reason || "source required"}`).join("\n") : "- нет");
    }
    out.push("", "## Товары со статусом NEEDS_SOURCE", "", "Эти карточки не получают ни content, ни characteristics при apply. Сначала нужно установить точную версию продукта и получить её технический лист/паспорт.", "");
    for (const row of report.rows.filter(item => item.status === "NEEDS_SOURCE")) {
        const need = row.proposedSpecs.filter(item => item.status === "NEEDS_SOURCE").map(item => item.code).join(", ");
        out.push(`### ${row.externalId} — ${row.title}`, "", `- **Не хватает:** точного технического источника для ${need || "description и SEO"}.`, `- **Почему нельзя записать:** текущая карточка/источник не позволяет доказать соответствие конкретной модификации; переносить значения соседних M-150 или Nivoplan из другой региональной версии небезопасно.`, `- **Что уточнить:** производителя, точное коммерческое наименование/модификацию, фасовку и технический лист именно этой поставки.`, "");
    }
    out.push("", "## Расхождения классификации", "", "Поле title/category не изменялось автоматически.", "");
    for (const row of report.rows.filter(item => item.classificationMismatches)) out.push(`- **${row.externalId}:** ${row.classificationMismatches}`);
    out.push("", "## Источники", "");
    for (const [id, source] of Object.entries(data.SOURCES)) out.push(`- **${id}**: ${source.url ? `[${source.title}](${source.url})` : source.title}. Проверено ${source.checkedAt}. ${source.note || ""}`);
    return out.join("\n") + "\n";
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const database = await openDatabase(options.db, options.apply);
    try {
        // Review artifacts must remain portable and must not expose a developer's
        // absolute filesystem path. The CLI still reads only the explicit --db.
        const report = { ...(await runBatch({ database, ...options })), database: "local snapshot (path omitted)", generatedAt: new Date().toISOString() };
        if (options.review) {
            const prefix = path.resolve(options.review);
            fs.mkdirSync(path.dirname(prefix), { recursive: true });
            fs.writeFileSync(`${prefix}.json`, JSON.stringify({ ...report, sources: DATA.SOURCES }, null, 2) + "\n");
            fs.writeFileSync(`${prefix}.md`, renderReview(report));
        }
        for (const row of report.rows) console.log(JSON.stringify({ MAT: row.externalId, title: row.title, currentDescription: row.current?.description,
            currentSpecsCount: row.current?.specsCount, currentSEO: row.current?.seo,
            proposedDescription: row.proposedContent.full_description?.status || row.status, proposedSpecs: row.specs,
            proposedSEO: { title: row.proposedContent.seo_title?.status || row.status, description: row.proposedContent.seo_description?.status || row.status },
            status: row.status, ...(row.error ? { error: row.error } : {}) }));
        console.log(JSON.stringify({ summary: report.summary, targetSummary: report.targetSummary, mode: report.mode }));
        if (report.summary.errors) process.exitCode = 1;
    } finally { await database.close(); }
}

module.exports = { CONFIRM, LIMITS, PROTECTED, inspectBatch, openDatabase, parseArgs, renderReview, runBatch, validateProposal };
if (require.main === module) main().catch(error => { console.error(`BATCH ABORTED: ${error.message}`); process.exitCode = 1; });
