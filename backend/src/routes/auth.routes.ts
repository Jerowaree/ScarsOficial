import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const correo = (req.body?.correo || "").trim().toLowerCase();
    const contrasena = req.body?.contrasena || "";

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const user = await prisma.usuarios.findFirst({
      where: { correo },
    });

    if (!user) {
      return res.status(401).json({ error: "CREDENCIALES" });
    }

    // Check for active block
    const block = await prisma.login_bloqueos.findUnique({
      where: { id_usuario: user.id_usuario }
    });

    if (block && block.bloqueado_hasta > new Date()) {
      return res.status(403).json({ error: "CUENTA_BLOQUEADA", hasta: block.bloqueado_hasta });
    }

    const ok = await bcrypt.compare(contrasena, user.contrasena);

    // Record attempt
    await prisma.login_intentos.create({
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
      const lastAttempts = await prisma.login_intentos.findMany({
        where: { id_usuario: user.id_usuario, exitoso: false },
        orderBy: { creado_en: "desc" },
        take: 5
      });

      if (lastAttempts.length >= 5) {
        const now = new Date();
        const blockUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins block
        await prisma.login_bloqueos.upsert({
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
      await prisma.login_bloqueos.delete({ where: { id_usuario: user.id_usuario } });
    }
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

    const token = jwt.sign(
      { uid: user.id_usuario, roles, permisos },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    return res.json({
      access_token: token,
      name: user.nombre_usuario,
      correo: user.correo,
      roles,
      permisos,
    });

  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
