const express = require("express");
const { DEFAULT_READINESS_TIMEOUT_MS, checkDatabaseReadiness } = require("../services/health");

function setHealthHeaders(res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
}

module.exports = function createHealthRouter({ dbProbe, logger, timeoutMs = DEFAULT_READINESS_TIMEOUT_MS }) {
    const router = express.Router();

    router.use(["/health", "/health/ready"], (req, res, next) => {
        setHealthHeaders(res);
        next();
    });

    router.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
    router.get("/health/ready", async (req, res) => {
        const result = await checkDatabaseReadiness({ dbProbe, timeoutMs });
        if (result.status === "ok") return res.status(200).json({ status: "ok" });

        if (result.status === "timeout") {
            logger.warn("database_readiness_timeout", { requestId: req.requestId, timeoutMs });
        } else {
            logger.warn("database_readiness_failure", {
                requestId: req.requestId,
                errorName: result.errorName,
                errorCode: result.errorCode
            });
        }
        return res.status(503).json({ status: "unavailable" });
    });

    return router;
};
