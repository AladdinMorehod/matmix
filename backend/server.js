const fs = require("fs");
const path = require("path");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
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

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        res.status(400).json({ success: false, message: "Некорректный формат данных." });
        return;
    }

    next(error);
});
app.use(session({
    // Development fallback only. Set SESSION_SECRET in production.
    secret: process.env.SESSION_SECRET || "matmix-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax"
    }
}));

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

app.get(["/", "/index.html"], sendPublicFile("index.html"));
app.get("/catalog.html", sendPublicFile("catalog.html"));
app.get("/login.html", sendPublicFile("login.html"));
app.get("/manager.html", sendPublicFile("manager.html"));
app.get("/manifest.webmanifest", sendPublicFile("manifest.webmanifest"));
app.get("/service-worker.js", sendPublicFile("service-worker.js"));

app.get("/manager", (req, res) => {
    sendPublicFile("manager.html")(req, res);
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Маршрут не найден." });
});

initDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`MatMix server started: http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error("Database init error:", error);
        process.exit(1);
    });
