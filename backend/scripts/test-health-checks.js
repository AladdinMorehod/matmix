const assert = require("assert");
const fs = require("fs");
const path = require("path");
const express = require("express");
const createHealthRouter = require("../routes/health");

function startTestServer({ dbProbe, timeoutMs = 1500 }) {
    const records = [];
    let sessionCalls = 0;
    const app = express();
    app.use((req, res, next) => { req.requestId = "health-test-request"; next(); });
    app.use(createHealthRouter({
        dbProbe,
        timeoutMs,
        logger: { warn: (event, fields) => records.push({ event, fields }) }
    }));
    app.use((req, res, next) => { sessionCalls += 1; res.cookie("should-not-exist", "1"); next(); });
    const server = app.listen(0, "127.0.0.1");
    return new Promise(resolve => server.once("listening", () => resolve({
        baseUrl: `http://127.0.0.1:${server.address().port}`,
        records,
        sessionCalls: () => sessionCalls,
        close: () => new Promise(done => server.close(done))
    })));
}

function assertHeaders(response) {
    assert.match(response.headers.get("cache-control") || "", /no-store/i);
    assert.match(response.headers.get("pragma") || "", /no-cache/i);
    assert.match(response.headers.get("x-robots-tag") || "", /noindex/i);
    assert.match(response.headers.get("x-robots-tag") || "", /nofollow/i);
    assert.match(response.headers.get("content-type") || "", /application\/json/i);
    assert.strictEqual(response.headers.get("set-cookie"), null);
}

async function request(baseUrl, path) {
    const response = await fetch(`${baseUrl}${path}`);
    const text = await response.text();
    return { response, text, body: JSON.parse(text) };
}

async function run() {
    const serverSource = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
    assert(serverSource.includes('app.get("/ready", async (req, res) => {'));
    assert(serverSource.includes('res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready" });'));
    assert(serverSource.includes('res.status(503).json({ status: "not_ready" });'));
    const playwrightConfig = fs.readFileSync(path.join(__dirname, "..", "..", "playwright.config.js"), "utf8");
    assert(playwrightConfig.includes('url: "http://127.0.0.1:4173/health"'));

    let probeCalls = 0;
    let test = await startTestServer({ dbProbe: async () => { probeCalls += 1; } });
    try {
        let result = await request(test.baseUrl, "/health");
        assert.strictEqual(result.response.status, 200);
        assert.deepStrictEqual(result.body, { status: "ok" });
        assertHeaders(result.response);
        assert.strictEqual(probeCalls, 0);
        assert.strictEqual(test.sessionCalls(), 0);

        result = await request(test.baseUrl, "/health/ready");
        assert.strictEqual(result.response.status, 200);
        assert.deepStrictEqual(result.body, { status: "ok" });
        assertHeaders(result.response);
        assert.strictEqual(probeCalls, 1);
        assert.strictEqual(test.sessionCalls(), 0);
        assert.deepStrictEqual(test.records, []);
    } finally { await test.close(); }

    const secretMessage = "SQLITE failure SELECT 1 users C:\\private\\matmix.db node_modules";
    test = await startTestServer({ dbProbe: async () => { const error = new Error(secretMessage); error.code = "SQLITE_CANTOPEN"; throw error; } });
    try {
        const result = await request(test.baseUrl, "/health/ready");
        assert.strictEqual(result.response.status, 503);
        assert.deepStrictEqual(result.body, { status: "unavailable" });
        assertHeaders(result.response);
        assert(!/SELECT|SQLITE|node_modules|users|private|matmix\.db|failure/i.test(result.text));
        assert.strictEqual(test.records.length, 1);
        assert.strictEqual(test.records[0].event, "database_readiness_failure");
        assert.deepStrictEqual(test.records[0].fields, { requestId: "health-test-request", errorName: "Error", errorCode: "SQLITE_CANTOPEN" });
        assert(!("error" in test.records[0].fields));
        assert(!JSON.stringify(test.records).includes(secretMessage));
        assert.strictEqual(test.sessionCalls(), 0);
    } finally { await test.close(); }

    const unhandled = [];
    const onUnhandled = reason => unhandled.push(reason);
    process.on("unhandledRejection", onUnhandled);
    test = await startTestServer({
        timeoutMs: 40,
        dbProbe: () => new Promise((resolve, reject) => setTimeout(() => reject(new Error("late private rejection")), 90))
    });
    try {
        const startedAt = Date.now();
        const result = await request(test.baseUrl, "/health/ready");
        const durationMs = Date.now() - startedAt;
        assert.strictEqual(result.response.status, 503);
        assert.deepStrictEqual(result.body, { status: "unavailable" });
        assertHeaders(result.response);
        assert(durationMs >= 30 && durationMs < 500, `Unexpected timeout duration: ${durationMs}ms`);
        assert.strictEqual(test.records.length, 1);
        assert.deepStrictEqual(test.records[0], { event: "database_readiness_timeout", fields: { requestId: "health-test-request", timeoutMs: 40 } });
        await new Promise(resolve => setTimeout(resolve, 100));
        assert.deepStrictEqual(unhandled, []);
        assert.strictEqual(test.records.length, 1);
        assert.strictEqual(test.sessionCalls(), 0);
    } finally {
        process.removeListener("unhandledRejection", onUnhandled);
        await test.close();
    }

    console.log(JSON.stringify({ health: "ok", readiness: "ok", failureSafety: "ok", timeout: "ok", legacyReadyContract: "ok", playwrightCompatibility: "ok" }));
}

run().catch(error => { console.error(error); process.exit(1); });
