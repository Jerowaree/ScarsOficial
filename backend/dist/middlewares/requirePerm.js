"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePerm = requirePerm;
function requirePerm(...codes) {
    return (req, res, next) => {
        const user = req.user;
        const ok = codes.every(c => user?.permisos?.includes(c));
        if (!ok)
            return res.status(403).json({ error: "PERMISO_DENEGADO" });
        next();
    };
}
