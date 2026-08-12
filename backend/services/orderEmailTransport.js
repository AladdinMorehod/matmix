const nodemailer = require("nodemailer");

const ORDER_EMAIL_ENV = Object.freeze({
    host: "MATMIX_ORDER_EMAIL_SMTP_HOST",
    port: "MATMIX_ORDER_EMAIL_SMTP_PORT",
    user: "MATMIX_ORDER_EMAIL_SMTP_USER",
    password: "MATMIX_ORDER_EMAIL_SMTP_PASSWORD",
    from: "MATMIX_ORDER_EMAIL_FROM",
    to: "MATMIX_ORDER_EMAIL_TO"
});

const SMTP_TIMEOUTS_MS = Object.freeze({
    connection: 10_000,
    greeting: 10_000,
    socket: 30_000
});

function required(env, name) {
    const value = String(env[name] || "").trim();
    if (!value) throw new Error(`${name} is required for the order email worker.`);
    return value;
}

function emailAddress(value, name) {
    const normalized = required({ [name]: value }, name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        throw new Error(`${name} must be a valid email address.`);
    }
    return normalized;
}

function loadOrderEmailConfig(env = process.env) {
    const host = required(env, ORDER_EMAIL_ENV.host);
    const portText = required(env, ORDER_EMAIL_ENV.port);
    const user = required(env, ORDER_EMAIL_ENV.user);
    const password = required(env, ORDER_EMAIL_ENV.password);
    const from = required(env, ORDER_EMAIL_ENV.from);
    const to = required(env, ORDER_EMAIL_ENV.to);
    const port = Number(portText);
    if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
        throw new Error(`${ORDER_EMAIL_ENV.port} must be an integer between 1 and 65535.`);
    }

    return {
        host,
        port,
        user,
        password,
        from: emailAddress(from, ORDER_EMAIL_ENV.from),
        to: emailAddress(to, ORDER_EMAIL_ENV.to)
    };
}

function createOrderEmailTransport(config, mailer = nodemailer) {
    return mailer.createTransport({
        host: config.host,
        port: config.port,
        secure: false,
        requireTLS: true,
        auth: { user: config.user, pass: config.password },
        connectionTimeout: SMTP_TIMEOUTS_MS.connection,
        greetingTimeout: SMTP_TIMEOUTS_MS.greeting,
        socketTimeout: SMTP_TIMEOUTS_MS.socket,
        tls: { minVersion: "TLSv1.2" }
    });
}

module.exports = {
    ORDER_EMAIL_ENV,
    SMTP_TIMEOUTS_MS,
    loadOrderEmailConfig,
    createOrderEmailTransport
};
