const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

class SqliteSessionStore extends session.Store {
    constructor(options = {}) {
        super();
        this.filePath = path.resolve(options.filePath);
        this.defaultTtlMs = Number(options.defaultTtlMs) || 8 * 60 * 60 * 1000;
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        this.db = new sqlite3.Database(this.filePath);
        this.ready = this.run("CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, sess TEXT NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)")
            .then(() => this.run("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)"));
        this.cleanupTimer = setInterval(() => this.clearExpired().catch(error => console.error("Session cleanup error:", error.message)), Number(options.cleanupIntervalMs) || 900000);
        this.cleanupTimer.unref?.();
    }
    run(sql, params = []) { return new Promise((resolve, reject) => this.db.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes }); })); }
    getRow(sql, params = []) { return new Promise((resolve, reject) => this.db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
    getExpiry(sess) { const value = sess?.cookie?.expires ? new Date(sess.cookie.expires).getTime() : 0; return Number.isFinite(value) && value > Date.now() ? value : Date.now() + this.defaultTtlMs; }
    get(sid, callback) { this.ready.then(async () => { const row = await this.getRow("SELECT sess, expires_at FROM sessions WHERE sid=?", [sid]); if (!row) return null; if (row.expires_at <= Date.now()) { await this.run("DELETE FROM sessions WHERE sid=?", [sid]); return null; } return JSON.parse(row.sess); }).then(value => callback(null, value)).catch(callback); }
    set(sid, sess, callback = () => {}) { this.ready.then(() => this.run("INSERT INTO sessions (sid,sess,expires_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(sid) DO UPDATE SET sess=excluded.sess,expires_at=excluded.expires_at,updated_at=excluded.updated_at", [sid, JSON.stringify(sess), this.getExpiry(sess), Date.now()])).then(() => callback()).catch(callback); }
    destroy(sid, callback = () => {}) { this.ready.then(() => this.run("DELETE FROM sessions WHERE sid=?", [sid])).then(() => callback()).catch(callback); }
    touch(sid, sess, callback = () => {}) { this.ready.then(() => this.run("UPDATE sessions SET expires_at=?,updated_at=? WHERE sid=?", [this.getExpiry(sess), Date.now(), sid])).then(() => callback()).catch(callback); }
    clearExpired() { return this.ready.then(() => this.run("DELETE FROM sessions WHERE expires_at<=?", [Date.now()])); }
    close() { clearInterval(this.cleanupTimer); return this.ready.catch(() => {}).then(() => new Promise((resolve, reject) => this.db.close(error => error ? reject(error) : resolve()))); }
}

module.exports = SqliteSessionStore;
