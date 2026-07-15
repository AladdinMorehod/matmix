const bcrypt = require("bcryptjs");
const express = require("express");
const { get, run } = require("../database");
const { requireAuth } = require("../middleware/auth");
const logger = require("../services/logger");

const router = express.Router();
const LOGIN_WINDOW_MS = Math.max(1000, Number(process.env.LOGIN_RATE_WINDOW_MS) || 15 * 60 * 1000);
const LOGIN_MAX_ATTEMPTS = Math.max(2, Number(process.env.LOGIN_RATE_MAX) || 5);
const loginAttempts = new Map();
const DUMMY_PASSWORD_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoO5uHhMZZbJ4k6QYfPvV6S6fY5Q7oQG6i";

function normalizeLogin(value) { return typeof value === "string" ? value.trim() : ""; }
function getPublicUser(user) { return { id: user.id, login: user.login, role: user.role, name: user.name }; }
function loginKey(req, login) { return `${req.ip}|${login.toLowerCase().slice(0, 160)}`; }
function getAttempt(key) {
    const attempt = loginAttempts.get(key);
    if (!attempt || attempt.resetAt <= Date.now()) { loginAttempts.delete(key); return null; }
    return attempt;
}
function regenerateSession(req) { return new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve())); }
function saveSession(req) { return new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve())); }

router.post("/login", async (req, res) => {
    try {
        const login = normalizeLogin(req.body?.login);
        const password = typeof req.body?.password === "string" ? req.body.password : "";
        if (!login || !password || login.length > 160 || password.length > 1024) {
            return res.status(400).json({ success: false, code: "INVALID_LOGIN_PAYLOAD", message: "Введите логин и пароль." });
        }

        const key = loginKey(req, login);
        const currentAttempt = getAttempt(key);
        if (currentAttempt && currentAttempt.count >= LOGIN_MAX_ATTEMPTS) {
            const retryAfter = Math.max(1, Math.ceil((currentAttempt.resetAt - Date.now()) / 1000));
            res.setHeader("Retry-After", String(retryAfter));
            logger.warn("login_rate_limited", { requestId: req.requestId });
            return res.status(429).json({ success: false, code: "LOGIN_RATE_LIMITED", message: "Слишком много попыток входа. Повторите позже." });
        }

        const user = await get("SELECT * FROM users WHERE login = ?", [login]);
        const isValidPassword = await bcrypt.compare(password, user?.password_hash || DUMMY_PASSWORD_HASH);
        if (!user || user.deleted_at || Number(user.is_active) === 0 || !isValidPassword) {
            const attempt = getAttempt(key) || { count: 0, resetAt: Date.now() + LOGIN_WINDOW_MS };
            attempt.count += 1;
            loginAttempts.set(key, attempt);
            logger.warn("login_failed", { requestId: req.requestId });
            return res.status(401).json({ success: false, code: "INVALID_CREDENTIALS", message: "Неверный логин или пароль" });
        }

        loginAttempts.delete(key);
        await regenerateSession(req);
        req.session.user = getPublicUser(user);
        await saveSession(req);
        logger.info("login_succeeded", { requestId: req.requestId, userId: user.id });
        res.json({ success: true, user: req.session.user });
    } catch (error) {
        logger.error("login_error", error, { requestId: req.requestId });
        res.status(500).json({ success: false, code: "LOGIN_FAILED", message: "Не удалось выполнить вход." });
    }
});

router.get("/me", (req, res) => {
    if (!req.session?.user) return res.status(401).json({ success: false, code: "AUTH_REQUIRED" });
    res.json({ success: true, user: req.session.user });
});

router.patch("/password", requireAuth, async (req, res) => {
    try {
        const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
        const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
        if (!currentPassword || newPassword.length < 6 || newPassword.length > 1024) return res.status(400).json({ success: false, message: "Укажите текущий пароль и новый пароль от 6 символов." });
        const user = await get("SELECT id, password_hash FROM users WHERE id = ?", [req.session.user.id]);
        const isValidPassword = user ? await bcrypt.compare(currentPassword, user.password_hash) : false;
        if (!user || !isValidPassword) return res.status(400).json({ success: false, message: "Текущий пароль неверный." });
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await run("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", [passwordHash, new Date().toISOString(), req.session.user.id]);
        res.json({ success: true });
    } catch (error) {
        console.error("Password change error:", error.message);
        res.status(500).json({ success: false, message: "Не удалось сменить пароль." });
    }
});

router.post("/logout", (req, res) => {
    const clear = () => res.clearCookie("matmix.sid", { path: "/" }).json({ success: true });
    if (!req.session) return clear();
    req.session.destroy(error => {
        if (error) return res.status(500).json({ success: false, code: "LOGOUT_FAILED", message: "Не удалось выйти." });
        clear();
    });
});

module.exports = router;
