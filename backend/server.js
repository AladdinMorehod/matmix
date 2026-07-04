const path = require("path");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const { initDatabase } = require("./database");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
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
app.use(express.static(publicDir));

app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

app.get("/manager", (req, res) => {
    res.sendFile(path.join(publicDir, "manager.html"));
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
