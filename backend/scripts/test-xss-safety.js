const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { sanitizeExcelText } = require("../utils/excelText");

const root = path.join(__dirname, "..", "..");
const publicScript = fs.readFileSync(path.join(root, "public", "js", "script.js"), "utf8");
const safeDomSource = fs.readFileSync(path.join(root, "public", "js", "safe-dom.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(safeDomSource, context);
const safe = context.window.MatMixSafe;

const payloads = [
    '<img src=x onerror=window.__xss=1>',
    '<svg/onload=window.__xss=1>',
    '"><script>window.__xss=1</script>',
    "'&<>"
];
for (const payload of payloads) {
    const escaped = safe.escapeHtml(payload);
    assert(!escaped.includes("<script"));
    assert(!escaped.includes("<img"));
    assert(!escaped.includes("<svg"));
}

assert.strictEqual(safe.escapeHtml("&lt;script&gt;"), "&amp;lt;script&amp;gt;");
assert.strictEqual(safe.productImageUrl("/uploads/products/MAT-000001-safe.png"), "/uploads/products/MAT-000001-safe.png");
for (const unsafeUrl of ["javascript:alert(1)", "data:text/html,x", "//evil.test/x", "/uploads/products/../x.png", "/uploads/products/x/evil.png"]) {
    assert.strictEqual(safe.productImageUrl(unsafeUrl), "");
}

for (const formula of ["=1+1", "+cmd", "-2+3", "@SUM(A1:A2)", "\t=HYPERLINK(\"https://example.invalid\",\"Click\")", "\r=cmd|' /C calc'!A0"]) {
    assert(sanitizeExcelText(formula).startsWith("'"), `Formula was not neutralized: ${formula}`);
}
assert.strictEqual(sanitizeExcelText("Обычный текст & < >"), "Обычный текст & < >");

const forbiddenCriticalPatterns = [
    /\$\{cleanDisplayText\(product\.name\)\}/,
    /\$\{product\.unit\}/,
    /onerror\s*=/i,
    /javascript\s*:/i
];
for (const pattern of forbiddenCriticalPatterns) assert(!pattern.test(publicScript), `Unsafe public render pattern remains: ${pattern}`);

const htmlFiles = ["index.html", "catalog.html", "manager.html"];
for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(root, "public", file), "utf8");
    assert(html.includes('js/safe-dom.js'), `${file} does not load safe-dom.js`);
    assert(!/\son[a-z]+\s*=/i.test(html), `${file} contains an inline event handler`);
    assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), `${file} contains an inline script`);
}

console.log(JSON.stringify({ success: true, payloads: payloads.length, urlCases: 5, formulaCases: 6 }));
