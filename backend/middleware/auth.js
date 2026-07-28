function requireAuth(req, res, next) {
    if (!req.session?.user) {
        res.status(401).json({ success: false, message: "Требуется авторизация" });
        return;
    }

    next();
}

function isMainAdmin(user) {
    return user?.login === "admin";
}

function canReplaceAllProductImages(user) {
    return user?.role === "admin" && isMainAdmin(user);
}

function requireRole(roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.session?.user) {
            res.status(401).json({ success: false, message: "Требуется авторизация" });
            return;
        }

        if (!allowedRoles.includes(req.session.user.role)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        next();
    };
}

module.exports = {
    canReplaceAllProductImages,
    isMainAdmin,
    requireAuth,
    requireRole
};
