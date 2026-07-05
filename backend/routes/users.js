const bcrypt = require("bcryptjs");
const express = require("express");
const { all, get, run } = require("../database");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function normalizeText(value) {
    return String(value || "").trim();
}

function normalizeRole(value) {
    const role = normalizeText(value);
    return ["admin", "manager"].includes(role) ? role : "";
}

function normalizeUser(row) {
    return {
        id: row.id,
        login: row.login,
        name: row.name,
        role: row.role,
        is_active: Number(row.is_active) !== 0,
        isActive: Number(row.is_active) !== 0,
        created_at: row.created_at || null,
        createdAt: row.created_at || null,
        updated_at: row.updated_at || null,
        updatedAt: row.updated_at || null
    };
}

router.get("/", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
        const rows = await all(`
            SELECT id, login, name, role, is_active, created_at, updated_at
            FROM users
            ORDER BY id ASC
        `);

        res.json({ success: true, users: rows.map(normalizeUser) });
    } catch (error) {
        console.error("Users list error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить пользователей." });
    }
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
        const login = normalizeText(req.body.login);
        const password = String(req.body.password || "");
        const name = normalizeText(req.body.name);
        const role = normalizeRole(req.body.role || "manager");

        if (!login) {
            res.status(400).json({ success: false, message: "Укажите логин." });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Пароль должен быть не короче 6 символов." });
            return;
        }

        if (!name) {
            res.status(400).json({ success: false, message: "Укажите имя пользователя." });
            return;
        }

        if (!role) {
            res.status(400).json({ success: false, message: "Недопустимая роль пользователя." });
            return;
        }

        const existing = await get("SELECT id FROM users WHERE login = ?", [login]);
        if (existing) {
            res.status(409).json({ success: false, message: "Пользователь с таким логином уже существует." });
            return;
        }

        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await run(
            `INSERT INTO users (login, password_hash, role, name, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [login, passwordHash, role, name, 1, now, now]
        );
        const createdUser = await get(
            `SELECT id, login, name, role, is_active, created_at, updated_at
             FROM users
             WHERE id = ?`,
            [result.id]
        );

        res.status(201).json({ success: true, user: normalizeUser(createdUser) });
    } catch (error) {
        console.error("User create error:", error);
        res.status(500).json({ success: false, message: "Не удалось создать пользователя." });
    }
});

router.patch("/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const isActive = req.body.isActive === true || req.body.isActive === 1 || req.body.isActive === "1";

        if (userId === Number(req.session.user.id) && !isActive) {
            res.status(400).json({ success: false, message: "Нельзя отключить самого себя." });
            return;
        }

        const user = await get("SELECT id FROM users WHERE id = ?", [userId]);
        if (!user) {
            res.status(404).json({ success: false, message: "Пользователь не найден." });
            return;
        }

        await run(
            "UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?",
            [isActive ? 1 : 0, new Date().toISOString(), userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("User status update error:", error);
        res.status(500).json({ success: false, message: "Не удалось изменить статус пользователя." });
    }
});

router.patch("/:id/password", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const password = String(req.body.password || "");

        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Пароль должен быть не короче 6 символов." });
            return;
        }

        const user = await get("SELECT id FROM users WHERE id = ?", [userId]);
        if (!user) {
            res.status(404).json({ success: false, message: "Пользователь не найден." });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await run(
            "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
            [passwordHash, new Date().toISOString(), userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("User password update error:", error);
        res.status(500).json({ success: false, message: "Не удалось сменить пароль пользователя." });
    }
});

module.exports = router;
