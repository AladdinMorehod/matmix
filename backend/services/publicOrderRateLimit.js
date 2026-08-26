const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;
const DEFAULT_MAX_KEYS = 10000;

function createPublicOrderRateLimiter({
    windowMs = Math.max(1000, Number(process.env.PUBLIC_ORDER_RATE_WINDOW_MS) || DEFAULT_WINDOW_MS),
    maxAttempts = Math.max(1, Number(process.env.PUBLIC_ORDER_RATE_MAX) || DEFAULT_MAX_ATTEMPTS),
    maxKeys = DEFAULT_MAX_KEYS,
    now = () => Date.now()
} = {}) {
    const attempts = new Map();

    return function publicOrderRateLimit(req, res, next) {
        const timestamp = now();
        for (const [key, value] of attempts) if (value.resetAt <= timestamp) attempts.delete(key);
        while (attempts.size >= maxKeys) attempts.delete(attempts.keys().next().value);
        const key = String(req.ip || req.socket?.remoteAddress || "unknown").slice(0, 160);
        const current = attempts.get(key);
        if (current && current.count >= maxAttempts) {
            const retryAfter = Math.max(1, Math.ceil((current.resetAt - timestamp) / 1000));
            res.setHeader("Retry-After", String(retryAfter));
            res.status(429).json({
                success: false,
                code: "PUBLIC_ORDER_RATE_LIMITED",
                message: "Слишком много заявок. Попробуйте позже."
            });
            return;
        }
        attempts.set(key, current
            ? { count: current.count + 1, resetAt: current.resetAt }
            : { count: 1, resetAt: timestamp + windowMs });
        next();
    };
}

module.exports = { DEFAULT_WINDOW_MS, DEFAULT_MAX_ATTEMPTS, DEFAULT_MAX_KEYS, createPublicOrderRateLimiter };
