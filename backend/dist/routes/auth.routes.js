"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    try {
        // 🔍 Ver qué llega realmente al backend
        console.log("💬 Body recibido:", req.body);
        // 🧩 Evita undefined y limpia espacios
        const correo = (req.body?.correo || "").trim().toLowerCase();
        const contrasena = req.body?.contrasena || "";
        if (!correo || !contrasena) {
            return res.status(400).json({ error: "Faltan datos" });
        }
        // 🔍 buscar usuario (usa findFirst para evitar error con undefined)
        const user = await prisma_1.prisma.usuarios.findFirst({
            where: { correo },
        });
        if (!user) {
            console.warn("❌ Usuario no encontrado:", correo);
            return res.status(401).json({ error: "CREDENCIALES" });
        }
        // 🔐 Verificar contraseña
        const ok = await bcryptjs_1.default.compare(contrasena, user.contrasena);
        // 📋 Registrar intento de login
        await prisma_1.prisma.login_intentos.create({
            data: {
                id_usuario: user?.id_usuario ?? null,
                correo_intento: correo,
                exitoso: ok, // Prisma espera un booleano, no 1 o 0
            },
        });
        if (!ok) {
            console.warn("❌ Contraseña incorrecta para:", correo);
            return res.status(401).json({ error: "CREDENCIALES" });
        }
        // 🧩 Obtener roles y permisos
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
        // 🪪 Generar token JWT
        const token = jsonwebtoken_1.default.sign({ uid: user.id_usuario, roles, permisos }, process.env.JWT_SECRET, { expiresIn: "2h" });
        // ✅ Respuesta final
        return res.json({
            access_token: token,
            name: user.nombre_usuario,
            correo: user.correo,
            roles,
            permisos,
        });
    }
    catch (err) {
        console.error("🔥 Error en login:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.default = router;
