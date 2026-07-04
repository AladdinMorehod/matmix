const bcrypt = require("bcryptjs");
const express = require("express");
const { get } = require("../database");
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
