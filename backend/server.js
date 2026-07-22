const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const SqliteSessionStore = require("./sessionStore");
const { initDatabase, databasePath, get, all } = require("./database");
const seo = require("./services/seo");
const legal = require("./services/legal");
const authRoutes = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const clientsRouter = require("./routes/clients");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const createSeoRouter = require("./routes/seo");
const createHealthRouter = require("./routes/health");
const logger = require("./services/logger");
const { assertProductionEnvironment, operationalReadiness, latestBackup } = require("./services/productionReadiness");
const { runtimePaths } = require("./services/productionBackup");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..", "public");
const productUploadsDir = path.resolve(process.env.PRODUCT_UPLOADS_PATH || path.join(publicDir, "uploads", "products"));
const runtimeLockPath = path.resolve(process.env.APP_RUNTIME_LOCK_PATH || path.join(path.dirname(databasePath), "matmix-runtime.lock"));

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) assertProductionEnvironment();
const seoSettings = seo.seoConfig();
if (isProduction && process.env.SEO_ALLOW_INDEXING === undefined) console.warn("SEO_ALLOW_INDEXING is not set; public pages will be noindex.");
const sessionCookieName = "matmix.sid";
const minimumSessionAge = process.env.NODE_ENV === "test" ? 1000 : 60000;
const sessionMaxAge = Math.max(minimumSessionAge, Number(process.env.SESSION_TTL_MS) || 8 * 60 * 60 * 1000);
const configuredSecret = String(process.env.SESSION_SECRET || "");
if (isProduction && configuredSecret.length < 32) throw new Error("SESSION_SECRET must be explicitly set to at least 32 characters in production.");
const sessionSecret = configuredSecret.length >= 32 ? configuredSecret : crypto.randomBytes(48).toString("base64url");
if (!isProduction && configuredSecret.length < 32) console.warn("SESSION_SECRET is missing or too short; using an ephemeral development secret. Sessions reset after restart.");
const sessionStore = new SqliteSessionStore({ filePath: process.env.SESSION_DB_PATH || path.join(__dirname, "database", "sessions.db"), defaultTtlMs: sessionMaxAge });

if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.disable("x-powered-by");
const allowedOrigins = new Set(String(process.env.CORS_ALLOWED_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean));

app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    req.requestId = /^[A-Za-z0-9._-]{8,100}$/.test(String(req.get("X-Request-ID") || "")) ? req.get("X-Request-ID") : crypto.randomUUID();
    res.setHeader("X-Request-ID", req.requestId);
    res.once("finish", () => logger.info("http_request", { requestId: req.requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6, userId: req.session?.user?.id || undefined }));
    next();
});

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:");
    if (isProduction && req.secure) res.setHeader("Strict-Transport-Security", "max-age=31536000");
    next();
});

app.use(createHealthRouter({ dbProbe: () => get("SELECT 1 AS ok"), logger }));

app.use((req, res, next) => {
    const origin = req.get("Origin");
    if (!origin) return next();
    const sameOrigin = origin === `${req.protocol}://${req.get("host")}`;
    const allowed = sameOrigin || allowedOrigins.has(origin);
    if (allowedOrigins.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") {
        if (!allowed) return res.status(403).json({ success: false, code: "ORIGIN_NOT_ALLOWED", message: "Origin is not allowed." });
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
        return res.sendStatus(204);
    }
    if (!["GET", "HEAD"].includes(req.method) && !allowed) return res.status(403).json({ success: false, code: "ORIGIN_NOT_ALLOWED", message: "Origin is not allowed." });
    next();
});

app.use(express.json({ limit: "1mb" }));
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        res.status(400).json({ success: false, message: "Некорректный формат данных." });
        return;
    }

    next(error);
});
app.use(session({
    name: sessionCookieName,
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: isProduction,
        maxAge: sessionMaxAge,
        path: "/"
    }
}));

app.get("/ready", async (req, res) => {
    try {
        const schema = await get("PRAGMA user_version");
        const paths = runtimePaths(); const backup = await latestBackup(paths.backupRoot);
        const backupFresh = backup && (Date.now() - backup.createdAt.getTime()) / 3600000 <= (Number(process.env.BACKUP_MAX_AGE_HOURS) || 36);
        const ready = Number(schema.user_version) === require("./databaseMigrations").CURRENT_SCHEMA_VERSION && legal.readiness().ready && await sessionStore.ready.then(() => true, () => false) && Boolean(backupFresh);
        res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready" });
    } catch (error) { logger.error("readiness_failure", error, { requestId: req.requestId }); res.status(503).json({ status: "not_ready" }); }
});

app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
});

if (!isProduction) fs.mkdirSync(productUploadsDir, { recursive: true });

app.use("/uploads/products", async (req, res, next) => {
    let filename;
    try { filename = decodeURIComponent(req.path).replace(/^\/+/, ""); } catch { res.status(404).end(); return; }
    if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..") || filename.includes("\0")) { res.status(404).end(); return; }
    const target = path.resolve(productUploadsDir, filename);
    if (!target.startsWith(`${productUploadsDir}${path.sep}`)) { res.status(404).end(); return; }
    try { if ((await fs.promises.lstat(target)).isSymbolicLink()) { res.status(404).end(); return; } } catch (error) { if (error.code !== "ENOENT") return next(error); }
    next();
});

app.use("/uploads/products", express.static(productUploadsDir, {
    dotfiles: "deny",
    index: false,
    redirect: false,
    maxAge: "7d",
    setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
        const filename = path.basename(res.req.path || "");
        if (/-[a-f0-9]{16}\.webp$/i.test(filename)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
    }
}));

app.use("/api/public/products", productsRoutes.publicRouter);
app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);

app.use((error, req, res, next) => {
    if (!error || !String(error.code || "").startsWith("SQLITE_")) return next(error);
    const { sqliteApiError } = require("./sqlite");
    const response = sqliteApiError(error);
    res.status(response.status).json({ success: false, code: response.code, message: response.message });
});

const publicAssetOptions = {
    dotfiles: "deny",
    index: false,
    redirect: false,
    maxAge: "1d",
    setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
    }
};

app.use("/css", express.static(path.join(publicDir, "css"), publicAssetOptions));
app.use("/js", express.static(path.join(publicDir, "js"), publicAssetOptions));
app.use("/img", express.static(path.join(publicDir, "img"), publicAssetOptions));

function sendPublicFile(fileName) {
    return (req, res) => {
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.sendFile(path.join(publicDir, fileName));
    };
}

function sendPrivateFile(fileName) {
    return (req, res) => {
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        res.sendFile(path.join(publicDir, fileName));
    };
}

const seoRouter = createSeoRouter({ publicDir, get, all, config: seoSettings });
app.use(seoRouter);
app.get("/login.html", sendPrivateFile("login.html"));
app.get("/manager.html", sendPrivateFile("manager.html"));
app.get("/manifest.webmanifest", sendPublicFile("manifest.webmanifest"));
app.get("/service-worker.js", sendPublicFile("service-worker.js"));
app.get("/favicon.ico", (req, res) => { res.setHeader("Cache-Control", "public, max-age=86400"); res.sendFile(path.join(publicDir, "img", "logo-burgundy.png")); });

app.get("/manager", (req, res) => {
    sendPrivateFile("manager.html")(req, res);
});

app.use((req, res) => {
    seoRouter.notFound(req, res);
});

let httpServer;
Promise.resolve()
    .then(async () => {
        if (isProduction) { const production = await operationalReadiness(); if (!production.ready) { const error = new Error("Production operational readiness failed; run npm run production:check for details."); error.code = "PRODUCTION_NOT_READY"; throw error; } }
        const { assertSupportedSchema } = require("./databaseMigrations");
        await assertSupportedSchema(require("./database").get, { production: isProduction });
        await initDatabase();
        fs.mkdirSync(path.dirname(runtimeLockPath), { recursive: true });
        fs.writeFileSync(runtimeLockPath, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }), { flag: "wx" });
        const host = process.env.HOST || "127.0.0.1";
        httpServer = app.listen(port, host, () => {
            logger.info("server_started", {
                host,
                port: Number(port),
                environment: process.env.NODE_ENV || "development"
            });
        });
    })
    .catch(error => {
        logger.error("startup_failure", error);
        process.exit(1);
    });

let shuttingDown = false;
async function shutdown(signal = "shutdown") {
    if (shuttingDown) return; shuttingDown = true; logger.info("shutdown_started", { signal });
    const timeoutMs = Math.max(5000, Number(process.env.SHUTDOWN_TIMEOUT_MS) || 30000);
    const graceful = (async () => {
        if (httpServer) await new Promise(resolve => httpServer.close(resolve));
        await sessionStore.close().catch(error => logger.error("session_store_close_failure", error));
        await new Promise(resolve => require("./database").db.close(() => resolve()));
        fs.rmSync(runtimeLockPath, { force: true }); logger.info("shutdown_complete", { signal });
    })();
    await Promise.race([graceful, new Promise((resolve, reject) => setTimeout(() => reject(new Error("Shutdown timeout exceeded.")), timeoutMs))]);
}
function handleSignal(signal) { shutdown(signal).then(() => process.exit(0)).catch(error => { logger.error("shutdown_forced", error, { signal }); fs.rmSync(runtimeLockPath, { force: true }); process.exit(1); }); }
process.once("SIGTERM", () => handleSignal("SIGTERM"));
process.once("SIGINT", () => handleSignal("SIGINT"));
if (process.env.NODE_ENV === "test" && process.connected) process.on("message", message => { if (message === "shutdown") handleSignal("test-ipc"); });
