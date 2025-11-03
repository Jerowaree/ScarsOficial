"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
    const hdr = req.headers.authorization;
    if (!hdr?.startsWith("Bearer "))
        return res.status(401).json({ error: "NO_AUTH" });
    try {
        const token = hdr.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ error: "TOKEN_INVALIDO" });
    }
}
