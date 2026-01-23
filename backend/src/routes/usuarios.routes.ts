import { Router } from "express";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

const r = Router();

// GET /api/usuarios - Listar todos los usuarios
r.get("/", auth, requirePerm("ADMIN_FULL_ACCESS"), async (req, res) => {
    try {
        const users = await prisma.usuarios.findMany({
            select: {
                id_usuario: true,
                nombre_usuario: true,
                correo: true,
                estado: true,
                fecha_creacion: true,
                usuario_roles: {
                    include: {
                        roles: true
                    }
                }
            },
            orderBy: { id_usuario: "desc" }
        });

        const formatted = users.map(u => ({
            id_usuario: u.id_usuario,
            nombre: u.nombre_usuario,
            correo: u.correo,
            estado: u.estado,
            creado_en: u.fecha_creacion,
            roles: u.usuario_roles.map(ur => ur.roles.nombre)
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error listing users:", error);
        res.status(500).json({ error: "Error al listar usuarios" });
    }
});

// POST /api/usuarios - Crear nuevo administrador
r.post("/", auth, requirePerm("ADMIN_FULL_ACCESS"), async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol = "ADMIN" } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const exists = await prisma.usuarios.findUnique({ where: { correo } });
        if (exists) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const hashed = await bcrypt.hash(contrasena, 10);

        const newUser = await prisma.$transaction(async (tx) => {
            // 1. Crear usuario
            const u = await tx.usuarios.create({
                data: {
                    nombre_usuario: nombre,
                    correo: correo.trim().toLowerCase(),
                    contrasena: hashed,
                    estado: "activo"
                }
            });

            // 2. Buscar rol
            const roleObj = await tx.roles.findUnique({ where: { nombre: rol } });
            if (!roleObj) throw new Error(`El rol ${rol} no existe`);

            // 3. Asignar rol
            await tx.usuario_roles.create({
                data: {
                    id_usuario: u.id_usuario,
                    id_rol: roleObj.id_rol
                }
            });

            return u;
        });

        res.status(201).json({
            id_usuario: newUser.id_usuario,
            nombre: newUser.nombre_usuario,
            correo: newUser.correo,
            message: "Usuario creado exitosamente"
        });

    } catch (error: any) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message || "Error al crear usuario" });
    }
});

// PUT /api/usuarios/:id - Actualizar usuario
r.put("/:id", auth, requirePerm("ADMIN_FULL_ACCESS"), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, correo, contrasena } = req.body;

        const data: any = {};
        if (nombre) data.nombre_usuario = nombre;
        if (correo) data.correo = correo.trim().toLowerCase();

        if (contrasena && contrasena.trim() !== "") {
            data.contrasena = await bcrypt.hash(contrasena, 10);
        }

        const updated = await prisma.usuarios.update({
            where: { id_usuario: id },
            data
        });

        res.json({
            id_usuario: updated.id_usuario,
            nombre: updated.nombre_usuario,
            correo: updated.correo,
            message: "Usuario actualizado correctamente"
        });
    } catch (error: any) {
        console.error("Error updating user:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "El correo ya está en uso por otro usuario" });
        }
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// DELETE /api/usuarios/:id - Eliminar usuario
r.delete("/:id", auth, requirePerm("ADMIN_FULL_ACCESS"), async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Evitar que el admin se borre a sí mismo
        if (id === (req as any).user.uid) {
            return res.status(400).json({ error: "No puedes eliminar tu propio usuario" });
        }

        await prisma.$transaction(async (tx) => {
            // Eliminar roles primero (por FK)
            await tx.usuario_roles.deleteMany({ where: { id_usuario: id } });
            // Eliminar auditoría asociada (si existe)
            await tx.auditoria.deleteMany({ where: { actor_usuario_id: id } });
            // Eliminar sesiones
            await tx.sesiones.deleteMany({ where: { id_usuario: id } });

            await tx.usuarios.delete({ where: { id_usuario: id } });
        });

        res.status(204).end();
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
});

export default r;
