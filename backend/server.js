const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const SqliteSessionStore = require("./sessionStore");
const { initDatabase } = require("./database");
const authRoutes = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const clientsRouter = require("./routes/clients");
const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..", "public");
const productUploadsDir = path.join(publicDir, "uploads", "products");

const isProduction = process.env.NODE_ENV === "production";
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
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:");
    if (isProduction && req.secure) res.setHeader("Strict-Transport-Security", "max-age=31536000");
    next();
});

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

app.use(["/api/auth", "/api/clients", "/api/users", "/api/products", "/api/orders"], (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    next();
});

fs.mkdirSync(productUploadsDir, { recursive: true });

app.use("/uploads/products", express.static(productUploadsDir, {
    dotfiles: "deny",
    index: false,
    redirect: false,
    maxAge: "7d",
    setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
    }
}));

app.use("/api/public/products", productsRoutes.publicRouter);
app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);

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
        res.sendFile(path.join(publicDir, fileName));
    };
}

app.get(["/", "/index.html"], sendPublicFile("index.html"));
app.get("/catalog.html", sendPublicFile("catalog.html"));
app.get("/login.html", sendPrivateFile("login.html"));
app.get("/manager.html", sendPrivateFile("manager.html"));
app.get("/manifest.webmanifest", sendPublicFile("manifest.webmanifest"));
app.get("/service-worker.js", sendPublicFile("service-worker.js"));

app.get("/manager", (req, res) => {
    sendPrivateFile("manager.html")(req, res);
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Маршрут не найден." });
});

let httpServer;
initDatabase()
    .then(() => {
        httpServer = app.listen(port, () => {
            console.log(`MatMix server started: http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error("Database init error:", error);
        process.exit(1);
    });

async function shutdown() {
    if (httpServer) await new Promise(resolve => httpServer.close(resolve));
    await sessionStore.close().catch(error => console.error("Session store close error:", error.message));
}
process.once("SIGTERM", () => shutdown().finally(() => process.exit(0)));
process.once("SIGINT", () => shutdown().finally(() => process.exit(0)));
