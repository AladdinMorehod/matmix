const bcrypt = require("bcryptjs");
const express = require("express");
const { get, run } = require("../database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function normalizeLogin(value) {
    return String(value || "").trim();
}

function getPublicUser(user) {
    return {
        id: user.id,
        login: user.login,
        role: user.role,
        name: user.name
    };
}

router.post("/login", async (req, res) => {
    try {
        const login = normalizeLogin(req.body.login);
        const password = String(req.body.password || "");

        if (!login || !password) {
            res.status(400).json({ success: false, message: "Введите логин и пароль." });
            return;
        }

        const user = await get("SELECT * FROM users WHERE login = ?", [login]);
        if (user && Number(user.is_active) === 0) {
            res.status(403).json({ success: false, message: "Пользователь отключен" });
            return;
        }

        const isValidPassword = user ? await bcrypt.compare(password, user.password_hash) : false;

        if (!user || !isValidPassword) {
            res.status(401).json({ success: false, message: "Неверный логин или пароль" });
            return;
        }

        req.session.user = getPublicUser(user);
        res.json({ success: true, user: req.session.user });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Не удалось выполнить вход." });
    }
});

router.get("/me", (req, res) => {
    if (!req.session?.user) {
        res.status(401).json({ success: false });
        return;
    }

    res.json({ success: true, user: req.session.user });
});

router.patch("/password", requireAuth, async (req, res) => {
    try {
        const currentPassword = String(req.body.currentPassword || "");
        const newPassword = String(req.body.newPassword || "");

        if (!currentPassword || newPassword.length < 6) {
            res.status(400).json({ success: false, message: "Укажите текущий пароль и новый пароль от 6 символов." });
            return;
        }

        const user = await get("SELECT id, password_hash FROM users WHERE id = ?", [req.session.user.id]);
        const isValidPassword = user ? await bcrypt.compare(currentPassword, user.password_hash) : false;

        if (!user || !isValidPassword) {
            res.status(400).json({ success: false, message: "Текущий пароль неверный." });
            return;
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await run(
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
            [passwordHash, new Date().toISOString(), req.session.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ success: false, message: "Не удалось сменить пароль." });
    }
});

router.post("/logout", requireAuth, (req, res) => {
    req.session.destroy(error => {
        if (error) {
            res.status(500).json({ success: false, message: "Не удалось выйти." });
            return;
        }

        res.clearCookie("connect.sid");
        res.json({ success: true });
    });
});

module.exports = router;
