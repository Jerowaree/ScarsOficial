"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    try {
        const correo = (req.body?.correo || "").trim().toLowerCase();
        const contrasena = req.body?.contrasena || "";
        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Faltan datos" });
        }
        const user = await prisma_1.prisma.usuarios.findFirst({
            where: { correo },
        });
        if (!user) {
            return res.status(401).json({ error: "CREDENCIALES" });
        }
        // Check for active block
        const block = await prisma_1.prisma.login_bloqueos.findUnique({
            where: { id_usuario: user.id_usuario }
        });
        if (block && block.bloqueado_hasta > new Date()) {
            return res.status(403).json({ error: "CUENTA_BLOQUEADA", hasta: block.bloqueado_hasta });
        }
        const ok = await bcryptjs_1.default.compare(contrasena, user.contrasena);
        // Record attempt
        await prisma_1.prisma.login_intentos.create({
            data: {
                id_usuario: user.id_usuario,
                correo_intento: correo,
                exitoso: ok,
                ip: req.ip,
                user_agent: req.headers["user-agent"]
            },
        });
        if (!ok) {
            // Handle lockout logic
            const lastAttempts = await prisma_1.prisma.login_intentos.findMany({
                where: { id_usuario: user.id_usuario, exitoso: false },
                orderBy: { creado_en: "desc" },
                take: 5
            });
            if (lastAttempts.length >= 5) {
                const now = new Date();
                const blockUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins block
                await prisma_1.prisma.login_bloqueos.upsert({
                    where: { id_usuario: user.id_usuario },
                    update: { bloqueado_hasta: blockUntil },
                    create: { id_usuario: user.id_usuario, bloqueado_hasta: blockUntil }
                });
                return res.status(403).json({ error: "CUENTA_BLOQUEADA_POR_INTENTOS" });
            }
            return res.status(401).json({ error: "CREDENCIALES" });
        }
        // Login successful - Clear block if exists
        if (block) {
            await prisma_1.prisma.login_bloqueos.delete({ where: { id_usuario: user.id_usuario } });
        }
        const userRoles = await prisma_1.prisma.usuario_roles.findMany({
            where: { id_usuario: user.id_usuario },
        });
        const roleIds = userRoles.map((ur) => ur.id_rol);
        const rolesRows = roleIds.length
            ? await prisma_1.prisma.roles.findMany({ where: { id_rol: { in: roleIds } } })
            : [];
        const roles = rolesRows.map((rw) => rw.nombre);
        const rperms = roleIds.length
            ? await prisma_1.prisma.rol_permisos.findMany({ where: { id_rol: { in: roleIds } } })
            : [];
        const permIds = rperms.map((rp) => rp.id_permiso);
        const permsRows = permIds.length
            ? await prisma_1.prisma.permisos.findMany({ where: { id_permiso: { in: permIds } } })
            : [];
        const permisos = Array.from(new Set(permsRows.map((p) => p.codigo)));
        const token = jsonwebtoken_1.default.sign({ uid: user.id_usuario, roles, permisos }, process.env.JWT_SECRET, { expiresIn: "2h" });
        // Enviar token en cookie httpOnly (protección contra XSS)
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000
        });
        return res.json({
            success: true,
            name: user.nombre_usuario,
            correo: user.correo,
            roles,
            permisos,
        });
    }
    catch (err) {
        console.error("Error en login:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});
// Logout - Limpiar cookie
router.post("/logout", (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return res.json({ success: true, message: "Sesión cerrada" });
});
// Verify - Verificar si la cookie es válida
router.get("/verify", auth_1.auth, (req, res) => {
    // Si llegamos aquí, el middleware auth validó la cookie
    return res.json({ authenticated: true, user: req.user });
});
exports.default = router;
