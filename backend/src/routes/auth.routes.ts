import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";

const router = Router();

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
    const user = await prisma.usuarios.findFirst({
      where: { correo },
    });

    if (!user) {
      console.warn("❌ Usuario no encontrado:", correo);
      return res.status(401).json({ error: "CREDENCIALES" });
    }

    // 🔐 Verificar contraseña
    const ok = await bcrypt.compare(contrasena, user.contrasena);

    // 📋 Registrar intento de login
    await prisma.login_intentos.create({
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
    const userRoles = await prisma.usuario_roles.findMany({
      where: { id_usuario: user.id_usuario },
    });
    const roleIds = userRoles.map((ur) => ur.id_rol);

    const rolesRows = roleIds.length
      ? await prisma.roles.findMany({ where: { id_rol: { in: roleIds } } })
      : [];
    const roles = rolesRows.map((rw) => rw.nombre);

    const rperms = roleIds.length
      ? await prisma.rol_permisos.findMany({ where: { id_rol: { in: roleIds } } })
      : [];
    const permIds = rperms.map((rp) => rp.id_permiso);

    const permsRows = permIds.length
      ? await prisma.permisos.findMany({ where: { id_permiso: { in: permIds } } })
      : [];
    const permisos = Array.from(new Set(permsRows.map((p) => p.codigo)));

    // 🪪 Generar token JWT
    const token = jwt.sign(
      { uid: user.id_usuario, roles, permisos },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    // ✅ Respuesta final
    return res.json({
      access_token: token,
      name: user.nombre_usuario,
      correo: user.correo,
      roles,
      permisos,
    });

  } catch (err) {
    console.error("🔥 Error en login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
