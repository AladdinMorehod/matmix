"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const SOURCE = require("./backfill-source-reviewed-content");

const CONFIRM_TOKEN = "APPLY_SOURCE_REVIEWED_CONTENT_PRODUCTION";
const PRODUCTION_DB = "/var/lib/matmix/matmix.db";
const PRODUCTION_HOST = "matmix-prod-01";
const REVIEW_PATH = path.resolve(__dirname, "../../docs/product-content/plaster-putty-backfill-review.json");
const EXPECTED_IDENTITY_BLOCKS = Object.freeze(["MAT-000027", "MAT-000028", "MAT-000060"]);
const EXPECTED_CONFLICTS = Object.freeze({
    "MAT-000006": ["base", "wall_layer_thickness"],
    "MAT-000007": ["base"],
    "MAT-000008": ["base"],
    "MAT-000017": ["purpose"],
    "MAT-000018": ["purpose"]
});

function parseArgs(args) {
    const options = { apply: false, db: null, confirm: null, expectedCommit: null, backupDir: null };
    const seen = new Set();
    for (let i = 0; i < args.length; i++) {
        const [key, ...tail] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected option value: ${key}`);
            if (key === "--apply") options.apply = true;
            continue;
        }
        if (!["--db", "--confirm", "--expected-commit", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        options[key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db) throw new Error("Explicit --db path is required");
    if (!options.expectedCommit || !/^[a-f0-9]{40}$/i.test(options.expectedCommit)) throw new Error("A full --expected-commit SHA is required");
    if (options.apply && options.confirm !== CONFIRM_TOKEN) throw new Error(`Apply requires --confirm ${CONFIRM_TOKEN}`);
    if (!options.apply && options.confirm) throw new Error("--confirm is valid only with --apply");
    return options;
}

function assertProductionTarget(dbPath) {
    if (dbPath !== PRODUCTION_DB) throw new Error(`Production DB target must be exactly ${PRODUCTION_DB}`);
}

function checkReleaseEnvironment({ expectedCommit, apply = false, hostname = os.hostname(), repoDir = process.cwd(), git = execFileSync }) {
    if (!/^[a-f0-9]{40}$/i.test(expectedCommit || "")) throw new Error("A full expected commit SHA is required");
    const actualCommit = git("git", ["rev-parse", "HEAD"], { cwd: repoDir, encoding: "utf8" }).trim();
    if (actualCommit.toLowerCase() !== expectedCommit.toLowerCase()) throw new Error(`HEAD ${actualCommit} differs from --expected-commit ${expectedCommit}`);
    const trackedStatus = git("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: repoDir, encoding: "utf8" }).trim();
    if (trackedStatus) throw new Error("Tracked worktree is not clean");
    if (apply && hostname !== PRODUCTION_HOST) throw new Error(`Apply is restricted to hostname ${PRODUCTION_HOST}; current host is ${hostname}`);
    return { commit: actualCommit, trackedWorktree: "clean", hostname, apply };
}

function sorted(values) { return [...values].sort(); }
function assertEqual(actual, expected, name) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${name} mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
function sourceConflictFields(report) {
    const conflicts = {};
    for (const row of report.rows) {
        const codes = sorted(row.attributes.filter(item => item.action === "SOURCE_CONFLICT").map(item => item.code));
        if (codes.length) conflicts[row.MAT] = codes;
    }
    return conflicts;
}

function validateProductionPreflight(report, review) {
    const approved = SOURCE.validateApprovedReviewLogical(report, review);
    if (report.allowlistCount !== 61 || report.rows.length !== 61 || new Set(report.rows.map(row => row.MAT)).size !== 61) throw new Error("Production preflight requires the exact unique 61-MAT allowlist");
    const reviewByMat = new Map(review.rows.map(row => [row.MAT, row]));
    for (const row of report.rows) {
        const sourceProduct = SOURCE.FIXED_ALLOWLIST.includes(row.MAT);
        if (!sourceProduct) throw new Error(`Out-of-allowlist product: ${row.MAT}`);
        const expectedSubcategory = reviewByMat.get(row.MAT)?.category;
        if (row.category !== "Смеси" || row.subcategory !== expectedSubcategory) throw new Error(`Exact live category/subcategory guard failed: ${row.MAT}`);
    }
    const safeAdds = report.summaries.plaster.willAdd + report.summaries.putty.willAdd;
    const updates = report.summaries.plaster.willUpdate + report.summaries.putty.willUpdate;
    const existing = report.summaries.plaster.existingOk + report.summaries.putty.existingOk;
    if (safeAdds !== 497 || updates !== 0 || existing !== 8
        || report.summaries.plaster.willAdd !== 200 || report.summaries.putty.willAdd !== 297
        || report.summaries.plaster.willUpdate !== 0 || report.summaries.putty.willUpdate !== 0) {
        throw new Error(`Attribute logical preflight mismatch: add=${safeAdds}, update=${updates}, existing=${existing}`);
    }
    const brands = report.summaries.brand;
    if (brands.SAFE_TO_FILL !== 57 || brands.EXISTING_OK !== 1 || brands.CONFLICT !== 0 || brands.IDENTITY_BLOCKED !== 3 || brands.NO_REVIEWED_BRAND !== 0) {
        throw new Error(`Brand logical preflight mismatch: ${JSON.stringify(brands)}`);
    }
    const blocked = sorted(report.rows.filter(row => row.brand.action === "IDENTITY_BLOCKED").map(row => row.MAT));
    assertEqual(blocked, sorted(EXPECTED_IDENTITY_BLOCKS), "Identity-blocked MAT list");
    assertEqual(sourceConflictFields(report), EXPECTED_CONFLICTS, "Source-conflict field list");
    return { ...approved, counts: { willAdd: safeAdds, willUpdate: updates, existingOk: existing, plasterWillAdd: 200, puttyWillAdd: 297, brandSafeToFill: brands.SAFE_TO_FILL, brandExistingOk: brands.EXISTING_OK, brandConflict: brands.CONFLICT, brandIdentityBlocked: brands.IDENTITY_BLOCKED } };
}

function validatePostApply(report) {
    const willAdd = report.summaries.plaster.willAdd + report.summaries.putty.willAdd;
    const willUpdate = report.summaries.plaster.willUpdate + report.summaries.putty.willUpdate;
    const existingOk = report.summaries.plaster.existingOk + report.summaries.putty.existingOk;
    const brand = report.summaries.brand;
    if (willAdd !== 0 || willUpdate !== 0 || existingOk !== 505 || brand.EXISTING_OK !== 58 || brand.SAFE_TO_FILL !== 0 || brand.CONFLICT !== 0 || brand.IDENTITY_BLOCKED !== 3) {
        throw new Error(`Post-apply logical state mismatch: add=${willAdd}, update=${willUpdate}, existing=${existingOk}, brand=${JSON.stringify(brand)}`);
    }
    const blocked = sorted(report.rows.filter(row => row.brand.action === "IDENTITY_BLOCKED").map(row => row.MAT));
    assertEqual(blocked, sorted(EXPECTED_IDENTITY_BLOCKS), "Post-apply identity-blocked MAT list");
    assertEqual(sourceConflictFields(report), EXPECTED_CONFLICTS, "Post-apply source-conflict field list");
    return { willAdd, willUpdate, existingOk, brand };
}

async function runProduction(db, { apply = false, review, backup = null } = {}) {
    const report = await SOURCE.inspect(db);
    const approved = validateProductionPreflight(report, review);
    if (!apply) return { mode: "dry-run", status: "PREFLIGHT_OK", counts: approved.counts, summaries: report.summaries };
    const integrity = await db.get("PRAGMA integrity_check");
    if (integrity?.integrity_check !== "ok") throw new Error(`Production DB integrity check failed: ${integrity?.integrity_check}`);
    const applied = await SOURCE.runBatch(db, {
        apply: true,
        backup,
        brandPlan: approved.brandPlan,
        approvedPlan: approved.reviewedSafePlan,
        verifyBeforeWrites: currentReport => {
            const currentApproved = validateProductionPreflight(currentReport, review);
            if (SOURCE.stablePlan(currentApproved.reviewedSafePlan) !== SOURCE.stablePlan(approved.reviewedSafePlan)
                || JSON.stringify(currentApproved.brandPlan) !== JSON.stringify(approved.brandPlan)) {
                throw new Error("Full approved logical plan changed inside the apply transaction");
            }
        },
        verifyBeforeCommit: postApplyReport => {
            const post = validatePostApply(postApplyReport);
            if (postApplyReport.rows.some(row => row.attributes.some(item => item.action === "WILL_UPDATE"))) throw new Error("Product attribute updates are not allowed in this rollout");
        }
    });
    if (applied.attributeAdded !== 497 || applied.attributeUpdated !== 0 || applied.brandAdded !== 57) throw new Error("Applied write counts differ from the approved production plan");
    const repeated = await SOURCE.inspect(db);
    const repeatSummary = validatePostApply(repeated);
    return { mode: "applied", status: "APPLIED", attributeAdded: applied.attributeAdded, attributeUpdated: applied.attributeUpdated, brandAdded: applied.brandAdded, backup: applied.backup, repeatSummary };
}

async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);
    assertProductionTarget(options.db);
    const environment = checkReleaseEnvironment({ expectedCommit: options.expectedCommit, apply: options.apply });
    if (options.apply && options.confirm !== CONFIRM_TOKEN) throw new Error(`Apply requires --confirm ${CONFIRM_TOKEN}`);
    const review = JSON.parse(await fs.promises.readFile(REVIEW_PATH, "utf8"));
    const db = await SOURCE.openDatabase(options.db, !options.apply);
    try {
        const result = await runProduction(db, {
            apply: options.apply,
            review,
            backup: options.apply ? () => SOURCE.createOnlineBackup(db, options.db, options.backupDir) : null
        });
        console.log(JSON.stringify({ ...result, target: PRODUCTION_DB, environment }, null, 2));
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { CONFIRM_TOKEN, PRODUCTION_DB, PRODUCTION_HOST, EXPECTED_IDENTITY_BLOCKS, EXPECTED_CONFLICTS, parseArgs, assertProductionTarget, checkReleaseEnvironment, sourceConflictFields, validateProductionPreflight, validatePostApply, runProduction };
