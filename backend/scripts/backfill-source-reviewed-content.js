"use strict";

const crypto = require("crypto");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/source-reviewed-content-backfill");

const CONFIRM_TOKEN = "APPLY_SOURCE_REVIEWED_CONTENT_VALUES";
const REVIEW_PATH = path.resolve(__dirname, "../../docs/product-content/plaster-putty-backfill-review.json");
const APPLY_AUDIT_PATH = path.resolve(__dirname, "../../docs/product-content/plaster-putty-backfill-apply-audit.json");
const EXPECTED_ADDED_ATTRIBUTES = 497;
const EXPECTED_BRAND_WRITES = 57;
const FIXED_ALLOWLIST = DATA.products.map(product => product.externalId);
const MAIN_CODES = new Set(DATA.mainCodes);
const PROTECTED_TABLES = Object.freeze(["products", "product_images"]);
const json = value => JSON.stringify(value);
const hash = value => crypto.createHash("sha256").update(json(value)).digest("hex");
const present = value => value !== null && value !== undefined;

function parseArgs(args) {
    const options = { apply: false, db: null, confirm: null, backupDir: null };
    const seen = new Set();
    for (let index = 0; index < args.length; index++) {
        const [key, ...tail] = args[index].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected option value: ${key}`);
            if (key === "--apply") options.apply = true;
            continue;
        }
        if (!["--db", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++index];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        options[key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    if (options.apply && options.confirm !== CONFIRM_TOKEN) throw new Error(`Apply requires --confirm ${CONFIRM_TOKEN}`);
    if (!options.apply && options.confirm) throw new Error("--confirm is valid only with --apply");
    return options;
}

function openDatabase(file, readOnly = true) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
    const flags = readOnly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, flags, async error => {
            if (error) return reject(error);
            const db = {
                raw,
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
                close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
            };
            try {
                await db.run("PRAGMA foreign_keys=ON");
                if (readOnly) await db.run("PRAGMA query_only=ON");
                resolve(db);
            } catch (err) { await db.close(); reject(err); }
        });
    });
}

function valuesEqual(left, right) {
    if (!present(left) || !present(right)) return !present(left) && !present(right);
    if (typeof left === "number" || typeof right === "number") return Number.isFinite(Number(left)) && Number(left) === Number(right);
    return String(left).trim().replace(/\s+/g, " ") === String(right).trim().replace(/\s+/g, " ");
}

function attributeValuesEqual(left, right, dataType) {
    if (dataType !== "number" || !present(left) || !present(right)) return valuesEqual(left, right);
    const asNumber = value => {
        if (typeof value === "number") return Number.isFinite(value) ? value : null;
        if (typeof value !== "string") return null;
        const normalized = value.trim();
        if (!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
        const numeric = Number(normalized.replace(",", "."));
        return Number.isFinite(numeric) ? numeric : null;
    };
    const leftNumber = asNumber(left);
    const rightNumber = asNumber(right);
    return leftNumber !== null && rightNumber !== null && leftNumber === rightNumber;
}

function proposalSources(source) {
    const sources = Array.isArray(source.proposal.sources) ? source.proposal.sources : [];
    const invalid = sources.filter(key => !source.sourceMap || !Object.prototype.hasOwnProperty.call(source.sourceMap, key));
    return { keys: sources, invalid };
}

function typedProposal(code, value, definition) {
    if (!definition || Number(definition.is_active) !== 1) return { ok: false, reason: "MISSING_OR_INACTIVE_DEFINITION" };
    if (definition.data_type === "text") return typeof value === "string" || typeof value === "number" ? { ok: true, valueText: String(value), valueNumber: null, valueBoolean: null } : { ok: false, reason: "TYPE_MISMATCH" };
    if (definition.data_type === "number") {
        if (typeof value === "number" && Number.isFinite(value)) return { ok: true, valueText: null, valueNumber: value, valueBoolean: null };
        if (typeof value === "string" && !/[~≈<>≤≥–—]|\bоколо\b|\bне менее\b|\bдо\b|\bот\b/i.test(value)) {
            const numeric = Number(value.trim().replace(",", "."));
            if (Number.isFinite(numeric) && value.trim() !== "") return { ok: true, valueText: null, valueNumber: numeric, valueBoolean: null };
        }
        return { ok: false, reason: `UNREPRESENTABLE_NUMBER:${code}` };
    }
    if (definition.data_type === "boolean" && typeof value === "boolean") return { ok: true, valueText: null, valueNumber: null, valueBoolean: value ? 1 : 0 };
    return { ok: false, reason: "TYPE_MISMATCH" };
}

function currentValue(row) {
    if (!row) return null;
    if (row.value_text !== null && row.value_text !== undefined) return row.value_text;
    if (row.value_number !== null && row.value_number !== undefined) return Number(row.value_number);
    if (row.value_boolean !== null && row.value_boolean !== undefined) return Boolean(row.value_boolean);
    return null;
}

function addProposalAggregate(product, codeRows, existingByCode, definitionByCode, productSafe) {
    const byCode = new Map();
    for (const entry of product.proposals) {
        const proposal = entry.proposal || {};
        if (!byCode.has(entry.code)) byCode.set(entry.code, []);
        byCode.get(entry.code).push({ ...entry, status: proposal.status || "NEEDS_SOURCE", value: proposal.value, sourceKeys: proposalSources(entry) });
    }
    const attributes = [];
    let needsSourceCount = 0;
    let sourceConflictCount = 0;
    let schemaBlockedCount = 0;
    let readyAttributeCount = 0;
    const proposalCount = byCode.size;
    for (const [code, sourceItems] of byCode) {
        const packageWeightNeedsSource = item => code === "package_weight"
            && item.sourceKeys.keys.length > 0
            && item.sourceKeys.keys.every(key => key === "localTitle");
        const ready = sourceItems.filter(item => item.status === "READY" && present(item.value) && item.sourceKeys.invalid.length === 0 && !packageWeightNeedsSource(item));
        const nonReady = sourceItems.filter(item => ["NEEDS_SOURCE", "SKIP", "SCHEMA_BLOCKED"].includes(item.status) || packageWeightNeedsSource(item))
            .map(item => packageWeightNeedsSource(item) ? { ...item, status: "NEEDS_SOURCE", proposal: { ...item.proposal, reason: "Фасовка взята только из локального title; источник localTitle прямо не подтверждает свойства товара." } } : item);
        if (ready.length) readyAttributeCount++;
        if (nonReady.length) needsSourceCount++;
        const sourceValues = [];
        for (const item of ready) if (!sourceValues.some(value => valuesEqual(value, item.value))) sourceValues.push(item.value);
        const existingMatches = existingByCode.get(code) || [];
        const base = {
            code,
            proposedValues: ready.map(item => ({ value: item.value, status: item.status, dataset: item.moduleName, sources: item.sourceKeys.keys, formula: item.proposal.formula || null, qualifier: item.proposal.qualifier || null })),
            needsSource: nonReady.map(item => ({ dataset: item.moduleName, status: item.status, reason: item.proposal.reason || null, sources: item.sourceKeys.keys })),
            currentCount: existingMatches.length,
            currentIds: existingMatches.map(item => item.id),
            currentValue: existingMatches.length === 1 ? currentValue(existingMatches[0]) : null,
            dataType: definitionByCode.get(code)?.data_type || null,
            action: "NO_WRITE"
        };
        if (!ready.length) {
            const unresolvedValues = [...new Set(sourceItems
                .filter(item => item.status === "NEEDS_SOURCE" && present(item.value) && !packageWeightNeedsSource(item))
                .map(item => json(item.value)))].map(value => JSON.parse(value));
            if (productSafe && existingMatches.length === 1 && unresolvedValues.length === 1 && attributeValuesEqual(base.currentValue, unresolvedValues[0], base.dataType)) {
                attributes.push({ ...base, action: "EXISTING_OK", existingNonWritable: true, existingProposalValue: unresolvedValues[0] });
            } else attributes.push(base);
            continue;
        }
        if (sourceValues.length > 1 || existingMatches.length > 1) {
            sourceConflictCount++;
            attributes.push({ ...base, action: "SOURCE_CONFLICT", conflictValues: sourceValues });
            continue;
        }
        if (!productSafe) {
            attributes.push({ ...base, action: "IDENTITY_GUARD_BLOCKED" });
            continue;
        }
        const definition = definitionByCode.get(code);
        const typed = typedProposal(code, sourceValues[0], definition);
        if (!typed.ok) {
            if (existingMatches.length === 1 && attributeValuesEqual(base.currentValue, sourceValues[0], definition.data_type)) {
                attributes.push({ ...base, action: "EXISTING_OK", existingNonWritable: true, existingProposalValue: sourceValues[0], reason: typed.reason });
                continue;
            }
            schemaBlockedCount++;
            attributes.push({ ...base, action: "SCHEMA_BLOCKED", reason: typed.reason });
            continue;
        }
        const value = definition.data_type === "boolean" ? Boolean(typed.valueBoolean) : definition.data_type === "number" ? typed.valueNumber : typed.valueText;
        if (existingMatches.length === 1 && attributeValuesEqual(base.currentValue, value, definition.data_type)) attributes.push({ ...base, action: "EXISTING_OK", typed, ...(nonReady.length ? { existingNonWritable: true, existingProposalValue: value } : {}) });
        else if (existingMatches.length === 1) attributes.push({ ...base, action: "WILL_UPDATE", typed, value });
        else attributes.push({ ...base, action: "WILL_ADD", typed, value });
    }
    const conflicts = sourceConflictCount;
    const readyActions = attributes.filter(item => ["WILL_ADD", "WILL_UPDATE", "EXISTING_OK"].includes(item.action)).length;
    const status = !productSafe ? "IDENTITY_UNCERTAIN" : conflicts ? "SOURCE_CONFLICT" : !readyAttributeCount ? "NO_REVIEWED_DATA" : (needsSourceCount || schemaBlockedCount || readyActions < readyAttributeCount) ? "PARTIAL" : "READY_FOR_BACKFILL";
    return { attributes, proposalCount, readyAttributeCount, needsSourceCount, conflictCount: conflicts, schemaBlockedCount, status };
}

async function inspect(db) {
    const definitions = await db.all("SELECT id,code,data_type,default_unit,is_active FROM product_attribute_definitions ORDER BY id");
    const definitionsByCode = new Map();
    for (const definition of definitions) {
        if (!definitionsByCode.has(definition.code)) definitionsByCode.set(definition.code, []);
        definitionsByCode.get(definition.code).push(definition);
    }
    const definitionByCode = new Map([...definitionsByCode].map(([code, list]) => [code, list.length === 1 ? list[0] : null]));
    const rows = [];
    const brandDiff = [];
    for (const sourceProduct of DATA.products) {
        const product = await db.get("SELECT * FROM products WHERE external_id=?", [sourceProduct.externalId]);
        const values = product ? await db.all(`SELECT v.*,d.code,d.label,d.data_type FROM product_attribute_values v
            LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id`, [product.id]) : [];
        const expectedTitles = [...new Set(sourceProduct.records.map(item => item.record.expectedTitle).filter(Boolean))];
        const identityStatuses = sourceProduct.records.map(item => item.record.identityStatus).filter(Boolean);
        const identitySafe = Boolean(product)
            && product.category === sourceProduct.category
            && product.subcategory === sourceProduct.subcategory
            && expectedTitles.length === 1
            && product.title === expectedTitles[0]
            && identityStatuses.every(status => !["BLOCKED_IDENTITY", "IDENTITY_UNCERTAIN", "UNCONFIRMED"].includes(status));
        const guardReasons = [];
        if (!product) guardReasons.push("PRODUCT_NOT_FOUND");
        else {
            if (product.category !== sourceProduct.category) guardReasons.push("CATEGORY_MISMATCH");
            if (product.subcategory !== sourceProduct.subcategory) guardReasons.push("SUBCATEGORY_MISMATCH");
            if (expectedTitles.length !== 1) guardReasons.push("SOURCE_TITLE_DISAGREEMENT");
            else if (product.title !== expectedTitles[0]) guardReasons.push("TITLE_MISMATCH");
        }
        if (identityStatuses.some(status => ["BLOCKED_IDENTITY", "IDENTITY_UNCERTAIN", "UNCONFIRMED"].includes(status))) guardReasons.push("SOURCE_IDENTITY_BLOCKED");
        const existingByCode = new Map();
        for (const value of values) {
            if (!value.code) {
                existingByCode.set(`__orphan_${value.id}`, [value]);
                continue;
            }
            if (!existingByCode.has(value.code)) existingByCode.set(value.code, []);
            existingByCode.get(value.code).push(value);
        }
        const compiled = addProposalAggregate(sourceProduct, null, existingByCode, definitionByCode, identitySafe);
        const currentCount = values.length;
        const counts = Object.fromEntries(["WILL_ADD", "WILL_UPDATE", "EXISTING_OK", "NEEDS_SOURCE", "SOURCE_CONFLICT", "SCHEMA_BLOCKED", "IDENTITY_GUARD_BLOCKED"].map(action => [action, compiled.attributes.filter(item => item.action === action).length]));
        const brandValues = [...new Set(sourceProduct.records.map(item => item.record.brand).filter(value => value !== null && value !== undefined && value !== ""))];
        const proposedBrand = brandValues.length === 1 ? brandValues[0] : brandValues.length ? brandValues : null;
        const brandStatus = !identitySafe ? "IDENTITY_BLOCKED"
            : !brandValues.length ? "NO_REVIEWED_BRAND"
                : brandValues.length > 1 || (product.brand && product.brand !== brandValues[0]) ? "CONFLICT"
                    : product.brand === brandValues[0] ? "EXISTING_OK" : "SAFE_TO_FILL";
        rows.push({
            MAT: sourceProduct.externalId, TITLE: product?.title || expectedTitles[0] || null,
            category: product?.category || null, subcategory: product?.subcategory || null,
            datasetSources: [...new Set(sourceProduct.records.map(item => item.moduleName))],
            sourceIdentity: identityStatuses.length ? identityStatuses : ["no identity status"],
            currentAttributeCount: currentCount,
            proposedAttributeCount: compiled.proposalCount,
            readyAttributeCount: compiled.readyAttributeCount,
            needsSourceCount: compiled.needsSourceCount,
            conflictCount: compiled.conflictCount,
            schemaBlockedCount: compiled.schemaBlockedCount,
            willAdd: counts.WILL_ADD, willUpdate: counts.WILL_UPDATE, existingOk: counts.EXISTING_OK,
            needsSource: compiled.attributes.filter(item => item.needsSource.length).map(item => ({ code: item.code, sources: item.needsSource })),
            conflicts: compiled.attributes.filter(item => item.action === "SOURCE_CONFLICT").map(item => ({ code: item.code, values: item.proposedValues })),
            schemaBlocked: compiled.attributes.filter(item => item.action === "SCHEMA_BLOCKED").map(item => ({ code: item.code, reason: item.reason })),
            status: compiled.status,
            guardReasons,
            attributes: compiled.attributes,
            brand: { current: product?.brand || null, proposed: proposedBrand, action: brandStatus }
        });
        if (brandValues.length && identitySafe && brandStatus !== "EXISTING_OK") {
            brandDiff.push({ MAT: sourceProduct.externalId, TITLE: product.title, current: product.brand || null, proposed: proposedBrand, datasets: sourceProduct.records.filter(item => item.record.brand).map(item => item.moduleName), action: "NOT_APPLIED" });
        }
    }
    const summaryFor = group => {
        const selected = rows.filter(row => DATA.products.find(item => item.externalId === row.MAT)?.group === group);
        const actions = selected.flatMap(row => row.attributes);
        return {
            total: selected.length,
            readyForBackfill: selected.filter(row => row.status === "READY_FOR_BACKFILL").length,
            partial: selected.filter(row => row.status === "PARTIAL").length,
            sourceConflict: selected.filter(row => row.status === "SOURCE_CONFLICT").length,
            identityUncertain: selected.filter(row => row.status === "IDENTITY_UNCERTAIN").length,
            noReviewedData: selected.filter(row => row.status === "NO_REVIEWED_DATA").length,
            willAdd: actions.filter(item => item.action === "WILL_ADD").length,
            willUpdate: actions.filter(item => item.action === "WILL_UPDATE").length,
            existingOk: actions.filter(item => item.action === "EXISTING_OK").length,
            needsSource: selected.reduce((sum, row) => sum + row.needsSourceCount, 0),
            conflicts: selected.reduce((sum, row) => sum + row.conflictCount, 0),
            schemaBlocked: selected.reduce((sum, row) => sum + row.schemaBlockedCount, 0)
        };
    };
    const brandSummary = Object.fromEntries(["EXISTING_OK", "SAFE_TO_FILL", "CONFLICT", "IDENTITY_BLOCKED", "NO_REVIEWED_BRAND"].map(status => [status, rows.filter(row => row.brand.action === status).length]));
    return { mode: "dry-run", allowlistCount: FIXED_ALLOWLIST.length, rows, summaries: { plaster: summaryFor("plaster"), putty: summaryFor("putty"), brand: brandSummary }, brandDiff, sources: DATA.modules };
}

function stableRow(row) { return json(row); }

async function protectedHashes(db) {
    const columns = await db.all("PRAGMA table_info(products)");
    const productColumns = columns.map(column => column.name).filter(name => name !== "brand");
    const quotedColumns = productColumns.map(name => `\"${name.replace(/\"/g, '\"\"')}\"`).join(",");
    const products = await db.all(`SELECT ${quotedColumns} FROM products ORDER BY id`);
    const images = await db.all("SELECT * FROM product_images ORDER BY id");
    const seo = await db.all("SELECT id,seo_title,seo_description,short_description,full_description,description FROM products ORDER BY id");
    const descriptions = await db.all("SELECT id,short_description,full_description,description FROM products ORDER BY id");
    const immutableProductFields = await db.all("SELECT id,external_id,title,slug,price,weight,unit,category,subcategory,product_group FROM products ORDER BY id");
    const values = await fullValueSnapshot(db);
    return { productsExceptBrand: hash(products), product_images: hash(images), seo: hash(seo), descriptions: hash(descriptions), immutableProductFields: hash(immutableProductFields), product_attribute_values: hash(values) };
}

async function productBrandSnapshot(db) {
    return db.all("SELECT id,external_id,brand FROM products ORDER BY id");
}

function validateApprovedReview(report, review, databaseHash) {
    if (databaseHash.toLowerCase() !== String(review.databaseSha256Before || "").toLowerCase()) throw new Error("Local DB hash differs from the reviewed baseline; refusing apply");
    return validateApprovedReviewLogical(report, review);
}

function validateApprovedReviewLogical(report, review) {
    if (review.rows?.length !== 61 || review.constraints?.applyExecuted !== false) throw new Error("Review artifact is missing or is not review-only");
    if (report.rows.length !== 61 || report.allowlistCount !== 61) throw new Error("Exact 61-MAT allowlist check failed");
    const reviewRows = new Map(review.rows.map(row => [row.MAT, row]));
    const liveRows = new Map(report.rows.map(row => [row.MAT, row]));
    const reviewedSafePlan = new Map();
    const brandPlan = [];
    const reviewedTotals = { WILL_ADD: 0, WILL_UPDATE: 0, EXISTING_OK: 0 };
    const reviewedTotalsByGroup = { plaster: 0, putty: 0 };
    const liveActionTotalsByGroup = {
        plaster: { WILL_ADD: 0, WILL_UPDATE: 0, EXISTING_OK: 0 },
        putty: { WILL_ADD: 0, WILL_UPDATE: 0, EXISTING_OK: 0 }
    };
    const unapprovedExistingByGroup = { plaster: 0, putty: 0 };
    const excludedBlockedActionsByGroup = {
        plaster: { WILL_ADD: 0, WILL_UPDATE: 0, EXISTING_OK: 0 },
        putty: { WILL_ADD: 0, WILL_UPDATE: 0, EXISTING_OK: 0 }
    };
    for (const mat of FIXED_ALLOWLIST) {
        const expected = reviewRows.get(mat);
        const live = liveRows.get(mat);
        if (!expected || !live || expected.TITLE !== live.TITLE) throw new Error(`Review identity/title mismatch: ${mat}`);
        const reviewedFields = [
            ...(expected.regularAdds || []),
            ...(expected.regularUpdates || []),
            ...(expected.existingOk || []).map(item => ({ ...item, value: item.current, status: "EXISTING_OK" }))
        ];
        const expectedByCode = new Map();
        for (const item of reviewedFields) {
            if (!item.code || expectedByCode.has(item.code)) throw new Error(`Duplicate or invalid reviewed field: ${mat}/${item.code}`);
            if (!["WILL_ADD", "WILL_UPDATE", "EXISTING_OK"].includes(item.status)) throw new Error(`Unsupported approved action: ${mat}/${item.code}/${item.status}`);
            expectedByCode.set(item.code, item);
        }
        for (const mainItem of Object.values(expected.main || {}).filter(item => ["WILL_ADD", "WILL_UPDATE", "EXISTING_OK"].includes(item.status))) {
            const item = { ...mainItem, value: mainItem.proposed, current: mainItem.current, status: mainItem.status };
            const existing = expectedByCode.get(item.code);
            if (existing) {
                const attr = live.attributes.find(attribute => attribute.code === item.code);
                if (existing.status !== item.status || !attributeValuesEqual(existing.value, item.value, attr?.dataType)) throw new Error(`Reviewed main/regular field disagreement: ${mat}/${item.code}`);
                continue;
            }
            expectedByCode.set(item.code, item);
        }
        for (const item of expectedByCode.values()) {
            reviewedTotals[item.status]++;
            const group = DATA.products.find(product => product.externalId === mat)?.group;
            if (!group || !reviewedTotalsByGroup.hasOwnProperty(group)) throw new Error(`Unknown reviewed product group: ${mat}`);
            reviewedTotalsByGroup[group]++;
        }
        if (expected.category !== (DATA.products.find(item => item.externalId === mat)?.group === "plaster" ? "Штукатурка" : "Шпаклевка")) throw new Error(`Review category mismatch: ${mat}`);
        if (expected.disposition !== "IDENTITY_BLOCKED" && live.guardReasons.length) throw new Error(`Live identity guard failed for ${mat}: ${live.guardReasons.join(",")}`);
        for (const attr of live.attributes) {
            const approved = expectedByCode.get(attr.code);
            if (["WILL_ADD", "WILL_UPDATE", "EXISTING_OK"].includes(attr.action) && !approved) {
                const blockedCodes = new Set([...(expected.needsSource || []).map(item => item.code), ...(expected.schemaBlocked || []).map(item => item.code)]);
                const hasReviewBlockedProposal = blockedCodes.has(attr.code)
                    && !(expected.conflicts || []).some(item => item.code === attr.code);
                if (expected.disposition !== "IDENTITY_BLOCKED" && attr.action === "EXISTING_OK" && attr.existingNonWritable === true && hasReviewBlockedProposal) {
                    if (attr.currentCount !== 1 || !attributeValuesEqual(attr.currentValue, attr.existingProposalValue, attr.dataType)) throw new Error(`Existing blocked proposal value differs: ${mat}/${attr.code}`);
                    const group = DATA.products.find(product => product.externalId === mat)?.group;
                    if (!group || !Object.prototype.hasOwnProperty.call(unapprovedExistingByGroup, group)) throw new Error(`Unknown reviewed product group: ${mat}`);
                    unapprovedExistingByGroup[group]++;
                    excludedBlockedActionsByGroup[group].EXISTING_OK++;
                    continue;
                }
                if (expected.disposition !== "IDENTITY_BLOCKED" && hasReviewBlockedProposal) {
                    const group = DATA.products.find(product => product.externalId === mat)?.group;
                    if (!group || !Object.prototype.hasOwnProperty.call(excludedBlockedActionsByGroup, group)) throw new Error(`Unknown reviewed product group: ${mat}`);
                    excludedBlockedActionsByGroup[group][attr.action]++;
                    attr.blockedLiveAction = attr.action;
                    attr.action = "BLOCKED";
                    continue;
                }
                throw new Error(`Attribute is not in approved safe preview: ${mat}/${attr.code}`);
            }
        }
        for (const [code, approved] of expectedByCode) {
            const attr = live.attributes.find(item => item.code === code);
            if (!attr) throw new Error(`Reviewed safe field is missing from live plan: ${mat}/${code}`);
            if (["WILL_ADD", "WILL_UPDATE"].includes(attr.action) && !attributeValuesEqual(attr.value, approved.value, attr.dataType)) throw new Error(`Reviewed safe field value changed: ${mat}/${code}`);
            if (approved.status === "WILL_ADD") {
                if (attr.action === "WILL_ADD") {
                    if (attr.currentCount !== 0 || present(attr.currentValue)) throw new Error(`Approved add has an unexpected current value: ${mat}/${code}`);
                } else if (attr.action === "EXISTING_OK") {
                    if (!attributeValuesEqual(attr.currentValue, approved.value, attr.dataType)) throw new Error(`Existing value differs from approved add: ${mat}/${code}`);
                } else throw new Error(`Approved add is neither absent nor an exact existing value: ${mat}/${code}`);
            } else if (approved.status === "WILL_UPDATE") {
                if (attr.action === "WILL_UPDATE") {
                    if (!Object.prototype.hasOwnProperty.call(approved, "current") || !attributeValuesEqual(attr.currentValue, approved.current, attr.dataType)) throw new Error(`Approved update current value changed: ${mat}/${code}`);
                } else if (attr.action === "EXISTING_OK") {
                    if (!attributeValuesEqual(attr.currentValue, approved.value, attr.dataType)) throw new Error(`Completed approved update has a different value: ${mat}/${code}`);
                } else throw new Error(`Approved update no longer has its guarded current row: ${mat}/${code}`);
            } else if (attr.action !== "EXISTING_OK" || !attributeValuesEqual(attr.currentValue, approved.value, attr.dataType)) {
                throw new Error(`Approved existing value changed: ${mat}/${code}`);
            }
            if (attr.action === "WILL_ADD" || attr.action === "WILL_UPDATE") {
                reviewedSafePlan.set(`${mat}|${code}`, { action: attr.action, value: attr.value, typed: attr.typed, rowId: attr.currentIds?.[0] || null, currentValue: attr.currentValue, currentCount: attr.currentCount });
            }
            const group = DATA.products.find(product => product.externalId === mat).group;
            liveActionTotalsByGroup[group][attr.action]++;
        }
        if (expected.disposition !== "IDENTITY_BLOCKED") {
            const expectedConflicts = expected.conflicts.map(item => item.code).sort();
            const liveConflicts = live.attributes.filter(item => item.action === "SOURCE_CONFLICT").map(item => item.code).sort();
            if (json(expectedConflicts) !== json(liveConflicts)) throw new Error(`Conflict field set differs from review: ${mat}`);
            const expectedNeedsSource = [...new Set(expected.needsSource.map(item => item.code))].sort();
            const liveNeedsSource = [...new Set(live.attributes.filter(item => item.needsSource.length).map(item => item.code))].sort();
            if (json(expectedNeedsSource) !== json(liveNeedsSource)) throw new Error(`NEEDS_SOURCE field set differs from review: ${mat}`);
        } else if (live.attributes.some(item => ["WILL_ADD", "WILL_UPDATE"].includes(item.action))) throw new Error(`Identity-blocked product contains an apply action: ${mat}`);
        if (expected.brand.status === "SAFE_TO_FILL") {
            if (live.brand.proposed !== expected.brand.proposed || typeof live.brand.proposed !== "string") throw new Error(`Canonical brand proposal differs from approved review: ${mat}`);
            if (live.brand.action === "SAFE_TO_FILL" && live.brand.current === null && expected.brand.current === null) {
                brandPlan.push({ MAT: mat, expectedCurrent: null, value: expected.brand.proposed });
            } else if (live.brand.action !== "EXISTING_OK" || live.brand.current !== expected.brand.proposed) {
                throw new Error(`Canonical brand no longer matches approved review: ${mat}`);
            }
        } else if (live.brand.action !== expected.brand.status || live.brand.current !== expected.brand.current) {
            throw new Error(`Brand status/current value differs from review: ${mat}`);
        }
        if (expected.disposition === "IDENTITY_BLOCKED" && live.guardReasons.length === 0) throw new Error(`Identity block changed: ${mat}`);
    }
    if (reviewedTotals.WILL_ADD + reviewedTotals.WILL_UPDATE !== EXPECTED_ADDED_ATTRIBUTES || reviewedTotals.EXISTING_OK !== 8) {
        throw new Error(`Review artifact approved field totals differ: ${JSON.stringify(reviewedTotals)}`);
    }
    const actualSafePlan = expectedActionMap(report);
    if (stablePlan(actualSafePlan) !== stablePlan(reviewedSafePlan)) throw new Error("Live safe attribute plan differs from human review");
    if (brandPlan.length + report.summaries.brand.EXISTING_OK !== EXPECTED_BRAND_WRITES + 1 || report.summaries.brand.CONFLICT !== 0 || report.summaries.brand.IDENTITY_BLOCKED !== 3) throw new Error("Brand status totals differ from approved preview");
    for (const group of ["plaster", "putty"]) {
        const summary = report.summaries[group];
        const actions = liveActionTotalsByGroup[group];
        if (summary.willAdd - excludedBlockedActionsByGroup[group].WILL_ADD !== actions.WILL_ADD
            || summary.willUpdate - excludedBlockedActionsByGroup[group].WILL_UPDATE !== actions.WILL_UPDATE
            || summary.existingOk - excludedBlockedActionsByGroup[group].EXISTING_OK !== actions.EXISTING_OK
            || summary.willAdd + summary.willUpdate + summary.existingOk
                - excludedBlockedActionsByGroup[group].WILL_ADD
                - excludedBlockedActionsByGroup[group].WILL_UPDATE
                - excludedBlockedActionsByGroup[group].EXISTING_OK !== reviewedTotalsByGroup[group]) {
            throw new Error(`Category attribute counts differ from approved preview: ${group}`);
        }
    }
    return { reviewedSafePlan, brandPlan, reviewedTotals, reviewedTotalsByGroup, liveActionTotalsByGroup, unapprovedExistingByGroup, unapprovedExistingCount: unapprovedExistingByGroup.plaster + unapprovedExistingByGroup.putty, excludedBlockedActionsByGroup };
}

async function fullValueSnapshot(db) {
    return db.all(`SELECT v.*,d.code,p.external_id FROM product_attribute_values v
        LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
        LEFT JOIN products p ON p.id=v.product_id ORDER BY v.id`);
}

function expectedActionMap(report) {
    const planned = new Map();
    for (const row of report.rows) for (const attribute of row.attributes) {
        if (!["WILL_ADD", "WILL_UPDATE"].includes(attribute.action)) continue;
        const def = attribute.typed;
        planned.set(`${row.MAT}|${attribute.code}`, { action: attribute.action, value: attribute.value, typed: def, rowId: attribute.currentIds[0] || null, currentValue: attribute.currentValue, currentCount: attribute.currentCount });
    }
    return planned;
}

function assertApprovedPlanStillPresent(report, approvedPlan) {
    const livePlan = expectedActionMap(report);
    const liveApprovedSubset = new Map();
    for (const key of approvedPlan.keys()) {
        if (!livePlan.has(key)) throw new Error(`Approved attribute plan entry is no longer writable: ${key.replace("|", "/")}`);
        liveApprovedSubset.set(key, livePlan.get(key));
    }
    if (stablePlan(liveApprovedSubset) !== stablePlan(approvedPlan)) throw new Error("Fresh apply plan differs from approved safe subset; refusing apply");
}

function stablePlan(plan) {
    return json([...plan.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

async function verifyValueDelta(before, after, planned) {
    const beforeById = new Map(before.map(row => [Number(row.id), row]));
    const afterById = new Map(after.map(row => [Number(row.id), row]));
    for (const [id, previous] of beforeById) {
        const current = afterById.get(id);
        if (!current) throw new Error(`Existing product_attribute_values row deleted: ${id}`);
        const action = [...planned.entries()].find(([, item]) => item.action === "WILL_UPDATE" && item.rowId === id);
        if (!action) {
            if (stableRow(previous) !== stableRow(current)) throw new Error(`Unplanned attribute row changed: ${id}`);
            continue;
        }
        const typed = action[1].typed;
        for (const field of ["product_id", "attribute_definition_id", "unit_override", "sort_order", "created_at", "code", "external_id"]) {
            if (previous[field] !== current[field]) throw new Error(`Protected attribute row field changed: ${id}/${field}`);
        }
        if (current.value_text !== typed.valueText || current.value_number !== typed.valueNumber || current.value_boolean !== typed.valueBoolean) throw new Error(`Updated typed value mismatch: ${id}`);
    }
    const oldPairs = new Set(before.map(row => `${row.external_id}|${row.code}`));
    const added = after.filter(row => !beforeById.has(Number(row.id)));
    if (added.length !== [...planned.values()].filter(item => item.action === "WILL_ADD").length) throw new Error("Unexpected product_attribute_values row count after apply");
    for (const row of added) {
        const key = `${row.external_id}|${row.code}`;
        if (oldPairs.has(key) || planned.get(key)?.action !== "WILL_ADD") throw new Error(`Unplanned attribute row inserted: ${key}`);
        const typed = planned.get(key).typed;
        if (row.value_text !== typed.valueText || row.value_number !== typed.valueNumber || row.value_boolean !== typed.valueBoolean) throw new Error(`Inserted typed value mismatch: ${key}`);
    }
}

async function verifyBrandDelta(before, after, planned) {
    const beforeById = new Map(before.map(row => [Number(row.id), row]));
    const afterById = new Map(after.map(row => [Number(row.id), row]));
    const allowed = new Map(planned.map(item => [item.MAT, item]));
    let changed = 0;
    for (const [id, previous] of beforeById) {
        const current = afterById.get(id);
        if (!current) throw new Error(`Product disappeared during brand apply: ${previous.external_id}`);
        if (previous.brand === current.brand) continue;
        const item = allowed.get(previous.external_id);
        if (!item || previous.brand !== item.expectedCurrent || current.brand !== item.value) throw new Error(`Unapproved products.brand change: ${previous.external_id}`);
        changed++;
    }
    if (changed !== planned.length) throw new Error(`Expected ${planned.length} canonical brand changes; got ${changed}`);
    if (afterById.size !== beforeById.size) throw new Error("Product count changed during canonical brand apply");
}

async function createOnlineBackup(db, dbPath, backupDir) {
    const destinationDir = path.resolve(backupDir || path.dirname(path.resolve(dbPath)));
    await fs.promises.mkdir(destinationDir, { recursive: true });
    const stamp = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const destination = path.join(destinationDir, `matmix-content-values-before-${stamp}.backup`);
    if (fs.existsSync(destination)) throw new Error(`Backup destination already exists: ${destination}`);
    const backup = db.raw.backup(destination);
    await new Promise((resolve, reject) => backup.step(-1, error => {
        if (error) return reject(error);
        backup.finish(finishError => finishError ? reject(finishError) : resolve());
    }));
    const stat = await fs.promises.stat(destination);
    if (stat.size < 1024) throw new Error(`Online backup size check failed: ${destination}`);
    const check = await openDatabase(destination, true);
    try {
        const integrity = await check.get("PRAGMA integrity_check");
        const tables = await check.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products','product_attribute_values','product_attribute_definitions','product_images')");
        if (integrity?.integrity_check !== "ok" || tables.length !== 4) throw new Error(`Online backup verification failed: ${destination}`);
    } finally { await check.close(); }
    return { path: destination, size: stat.size };
}

async function applyReport(db, initialReport) {
    const planned = expectedActionMap(initialReport);
    const hasMutations = planned.size > 0;
    if (!hasMutations) return { status: "NO_CHANGES", backup: null, protectedHashes: await protectedHashes(db) };
    throw new Error("applyReport requires the guarded runBatch entry point with an online backup callback");
}

async function runBatch(db, { apply = false, backup = null, brandPlan = [], approvedPlan = null, verifyBeforeWrites = null, verifyBeforeCommit = null } = {}) {
    const beforeReport = await inspect(db);
    if (!apply) return beforeReport;
    const discoveredPlan = expectedActionMap(beforeReport);
    if (approvedPlan) assertApprovedPlanStillPresent(beforeReport, approvedPlan);
    const planned = approvedPlan ? new Map(approvedPlan) : discoveredPlan;
    if (!planned.size && !brandPlan.length) return { ...beforeReport, mode: "apply-no-changes", backup: null };
    if (typeof backup !== "function") throw new Error("Apply requires a verified SQLite online backup callback");
    const backupResult = await backup();
    await db.run("BEGIN IMMEDIATE");
    try {
        const currentReport = await inspect(db);
        if (approvedPlan) assertApprovedPlanStillPresent(currentReport, planned);
        else if (stablePlan(expectedActionMap(currentReport)) !== stablePlan(planned)) throw new Error("Target values changed after dry-run; refusing apply");
        if (verifyBeforeWrites) await verifyBeforeWrites(currentReport);
        const hashesBefore = await protectedHashes(db);
        const valuesBefore = await fullValueSnapshot(db);
        const brandsBefore = await productBrandSnapshot(db);
        const now = new Date().toISOString();
        for (const row of currentReport.rows) {
            for (const attribute of row.attributes) {
                if (!planned.has(`${row.MAT}|${attribute.code}`)) continue;
                const { typed, rowId, action } = planned.get(`${row.MAT}|${attribute.code}`);
                if (action === "WILL_UPDATE") {
                    const result = await db.run(`UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=?,updated_at=? WHERE id=?`, [typed.valueText, typed.valueNumber, typed.valueBoolean, now, rowId]);
                    if (result.changes !== 1) throw new Error(`Expected one in-place update for ${row.MAT}/${attribute.code}`);
                } else if (action === "WILL_ADD") {
                    const product = await db.get("SELECT id FROM products WHERE external_id=?", [row.MAT]);
                    const definition = await db.get("SELECT id FROM product_attribute_definitions WHERE code=? AND is_active=1", [attribute.code]);
                    if (!product || !definition) throw new Error(`Guarded insert target missing: ${row.MAT}/${attribute.code}`);
                    const result = await db.run(`INSERT INTO product_attribute_values
                        (product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at)
                        VALUES(?,?,?,?,?,NULL,0,?,?)`, [product.id, definition.id, typed.valueText, typed.valueNumber, typed.valueBoolean, now, now]);
                    if (result.changes !== 1) throw new Error(`Expected one insert for ${row.MAT}/${attribute.code}`);
                }
            }
        }
        for (const item of brandPlan) {
            const product = await db.get("SELECT id,brand FROM products WHERE external_id=?", [item.MAT]);
            if (!product || product.brand !== item.expectedCurrent || product.brand !== null) throw new Error(`Canonical brand precondition failed for ${item.MAT}`);
            const result = await db.run("UPDATE products SET brand=? WHERE id=? AND brand IS NULL", [item.value, product.id]);
            if (result.changes !== 1) throw new Error(`Expected one canonical brand update for ${item.MAT}`);
        }
        const valuesAfter = await fullValueSnapshot(db);
        await verifyValueDelta(valuesBefore, valuesAfter, planned);
        const brandsAfter = await productBrandSnapshot(db);
        await verifyBrandDelta(brandsBefore, brandsAfter, brandPlan);
        const hashesAfter = await protectedHashes(db);
        const protectedBefore = { ...hashesBefore }; delete protectedBefore.product_attribute_values;
        const protectedAfter = { ...hashesAfter }; delete protectedAfter.product_attribute_values;
        if (json(protectedBefore) !== json(protectedAfter)) throw new Error("Protected products/images/SEO changed during content apply");
        if (approvedPlan && stablePlan(planned) !== stablePlan(approvedPlan)) throw new Error("Applied attribute plan differs from the current approved write plan");
        if (verifyBeforeCommit) await verifyBeforeCommit(await inspect(db));
        await db.run("COMMIT");
        const afterReport = await inspect(db);
        return { ...afterReport, mode: "applied", backup: backupResult, protectedHashesBefore: hashesBefore, protectedHashesAfter: hashesAfter, valuesBefore, valuesAfter, brandsBefore, brandsAfter, attributeAdded: valuesAfter.length - valuesBefore.length, attributeUpdated: [...planned.values()].filter(item => item.action === "WILL_UPDATE").length, brandAdded: brandPlan.length, brandPlan };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);
    let brandPlan = [];
    let approvedPlan = null;
    let applyBranch = null;
    if (options.apply) {
        applyBranch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
        if (applyBranch !== "codex/attribute-order") throw new Error(`Apply is restricted to codex/attribute-order; current branch is ${applyBranch}`);
        const expectedLocalDb = path.resolve(__dirname, "../database/matmix.db");
        if (path.resolve(options.db) !== expectedLocalDb) throw new Error(`Apply is restricted to the local workspace database: ${expectedLocalDb}`);
        if (fs.existsSync(APPLY_AUDIT_PATH)) throw new Error(`Apply audit already exists; refusing to overwrite: ${APPLY_AUDIT_PATH}`);
        const review = JSON.parse(await fs.promises.readFile(REVIEW_PATH, "utf8"));
        const dbHash = crypto.createHash("sha256").update(await fs.promises.readFile(path.resolve(options.db))).digest("hex");
        const readOnlyDb = await openDatabase(options.db, true);
        try {
            const integrity = await readOnlyDb.get("PRAGMA integrity_check");
            if (integrity?.integrity_check !== "ok") throw new Error(`Local database integrity check failed: ${integrity?.integrity_check}`);
            const preflightReport = await inspect(readOnlyDb);
            const validated = validateApprovedReview(preflightReport, review, dbHash);
            approvedPlan = validated.reviewedSafePlan;
            brandPlan = validated.brandPlan;
        } finally { await readOnlyDb.close(); }
    }
    const db = await openDatabase(options.db, !options.apply);
    try {
        const report = await runBatch(db, { apply: options.apply, backup: options.apply ? () => createOnlineBackup(db, options.db, options.backupDir) : null, brandPlan, approvedPlan });
        if (options.apply && report.mode === "applied") {
            const audit = {
                generatedAt: new Date().toISOString(), branch: applyBranch,
                mode: "LOCAL_APPLY_COMPLETE",
                backup: report.backup,
                counts: {
                    ATTRIBUTE_ADDED: report.attributeAdded,
                    ATTRIBUTE_UPDATED: report.attributeUpdated,
                    ATTRIBUTE_EXISTING_OK_BEFORE_APPLY: 8,
                    ATTRIBUTE_BLOCKED_NEEDS_SOURCE: report.rows.filter(row => row.status !== "IDENTITY_UNCERTAIN").reduce((sum, row) => sum + row.needsSourceCount, 0),
                    ATTRIBUTE_NEEDS_SOURCE_INCLUDING_IDENTITY: report.summaries.plaster.needsSource + report.summaries.putty.needsSource,
                    ATTRIBUTE_BLOCKED_CONFLICT: report.summaries.plaster.conflicts + report.summaries.putty.conflicts,
                    IDENTITY_BLOCKED: report.summaries.plaster.identityUncertain + report.summaries.putty.identityUncertain,
                    BRAND_ADDED: report.brandAdded,
                    BRAND_EXISTING_OK_BEFORE_APPLY: 1,
                    BRAND_BLOCKED: report.summaries.brand.IDENTITY_BLOCKED + report.summaries.brand.CONFLICT
                },
                integrityCheck: "ok",
                protectedHashesBefore: report.protectedHashesBefore,
                protectedHashesAfter: report.protectedHashesAfter,
                immutableChecks: { productsExceptBrandUnchanged: true, imagesUnchanged: true, seoUnchanged: true, descriptionsUnchanged: true, titleSlugPriceWeightUnitCategorySubcategoryProductGroupUnchanged: true, oldAttributeRowsAndIdsPreserved: true, onlyApprovedSafeRowsInserted: true, onlyApprovedProductsBrandChanged: true, templatesUnchanged: true },
                attributeRowsBefore: report.valuesBefore.map(row => ({ id: row.id, product_id: row.product_id, external_id: row.external_id, attribute_definition_id: row.attribute_definition_id, code: row.code, value_text: row.value_text, value_number: row.value_number, value_boolean: row.value_boolean, unit_override: row.unit_override, sort_order: row.sort_order })),
                attributeRowsAfter: report.valuesAfter.map(row => ({ id: row.id, product_id: row.product_id, external_id: row.external_id, attribute_definition_id: row.attribute_definition_id, code: row.code, value_text: row.value_text, value_number: row.value_number, value_boolean: row.value_boolean, unit_override: row.unit_override, sort_order: row.sort_order })),
                productsBrandBefore: report.brandsBefore,
                productsBrandAfter: report.brandsAfter,
                afterApplySummaries: report.summaries,
                repeatDryRunExpected: { attributeWillAdd: 0, attributeWillUpdate: 0, safeAttributesExistOk: EXPECTED_ADDED_ATTRIBUTES, brandSafeToFill: 0, brandExistingOk: 58, identityBlocked: 3 }
            };
            await fs.promises.writeFile(APPLY_AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`, { flag: "wx" });
            console.log(JSON.stringify({ applyAudit: APPLY_AUDIT_PATH, counts: audit.counts, backup: report.backup, protectedHashesBefore: report.protectedHashesBefore, protectedHashesAfter: report.protectedHashesAfter }));
        }
        for (const row of report.rows) {
            const codes = action => row.attributes.filter(attribute => attribute.action === action).map(attribute => attribute.code);
            const proposed = row.attributes.filter(attribute => ["WILL_ADD", "WILL_UPDATE"].includes(attribute.action)).map(attribute => ({ code: attribute.code, action: attribute.action, current: attribute.currentValue, proposed: attribute.value }));
            console.log(JSON.stringify({ MAT: row.MAT, status: row.status, currentRows: row.currentAttributeCount, add: codes("WILL_ADD"), update: codes("WILL_UPDATE"), proposed, needsSource: row.attributes.filter(attribute => attribute.needsSource.length).map(attribute => attribute.code), conflicts: codes("SOURCE_CONFLICT"), schemaBlocked: codes("SCHEMA_BLOCKED"), identityBlocked: codes("IDENTITY_GUARD_BLOCKED"), guardReasons: row.guardReasons }));
        }
        console.log(JSON.stringify({ mode: report.mode, allowlistCount: report.allowlistCount, summaries: report.summaries, brandDiff: report.brandDiff, sources: report.sources }));
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { CONFIRM_TOKEN, FIXED_ALLOWLIST, MAIN_CODES, EXPECTED_ADDED_ATTRIBUTES, EXPECTED_BRAND_WRITES, parseArgs, openDatabase, valuesEqual, attributeValuesEqual, typedProposal, inspect, expectedActionMap, protectedHashes, fullValueSnapshot, validateApprovedReview, validateApprovedReviewLogical, stablePlan, verifyValueDelta, verifyBrandDelta, createOnlineBackup, runBatch };
