"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/empleados.routes.ts
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const r = (0, express_1.Router)();
// Helpers: mapear horario UI <-> DB
const toDBHorario = (h) => {
    if (!h)
        return undefined;
    if (h === "Mañana")
        return "Ma_ana";
    if (h === "Mañana y Tarde")
        return "Ma_ana_y_Tarde";
    if (h === "Tarde")
        return "Tarde";
    return undefined;
};
const fromDBHorario = (h) => {
    if (h === "Ma_ana")
        return "Mañana";
    if (h === "Ma_ana_y_Tarde")
        return "Mañana y Tarde";
    if (h === "Tarde")
        return "Tarde";
    return null;
};
const EmpleadoSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(1, "Nombres requeridos"),
    apellidos: zod_1.z.string().min(1, "Apellidos requeridos"),
    dni: zod_1.z.string().max(8).optional().nullable(),
    correo: zod_1.z.string().email("Correo inválido").or(zod_1.z.literal("")).optional().nullable(),
    celular: zod_1.z.string().max(15).optional().nullable(),
    cargo: zod_1.z.string().max(100).optional().nullable(),
    sueldo: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.instanceof(client_1.Prisma.Decimal)]).optional().nullable().transform(val => (val === "" || val == null) ? null : new client_1.Prisma.Decimal(String(val))),
    horario: zod_1.z.enum(["Mañana", "Tarde", "Mañana y Tarde"]).optional().nullable().transform(toDBHorario),
    estado: zod_1.z.enum(["Activo", "Inactivo"]).optional().nullable(),
    id_usuario: zod_1.z.number().optional().nullable(),
});
// GET /api/empleados?q=
r.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("empleado:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const where = q
        ? {
            OR: [
                { codigo: { contains: q } },
                { nombres: { contains: q } },
                { apellidos: { contains: q } },
                { dni: { contains: q } },
                { correo: { contains: q } },
                { celular: { contains: q } },
                { cargo: { contains: q } },
            ],
        }
        : undefined;
    const rows = await prisma_1.prisma.empleados.findMany({
        where,
        orderBy: { id_empleado: "desc" },
    });
    // Normalizamos horario para UI
    const data = rows.map((e) => ({
        ...e,
        horario: fromDBHorario(e.horario),
    }));
    res.json(data);
});
// POST /api/empleados
r.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("empleado:create"), async (req, res) => {
    try {
        const validatedData = EmpleadoSchema.parse(req.body);
        // Generar código EMP###
        const count = await prisma_1.prisma.empleados.count();
        const codigo = `EMP${String(count + 1).padStart(3, "0")}`;
        const created = await prisma_1.prisma.empleados.create({
            data: {
                ...validatedData,
                codigo,
                horario: validatedData.horario,
                sueldo: validatedData.sueldo,
            },
        });
        res.status(201).json({
            ...created,
            horario: fromDBHorario(created.horario),
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error creating empleado:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
// PUT /api/empleados/:id
r.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("empleado:update"), async (req, res) => {
    try {
        const validatedData = EmpleadoSchema.partial().parse(req.body);
        const updated = await prisma_1.prisma.empleados.update({
            where: { id_empleado: Number(req.params.id) },
            data: {
                ...validatedData,
                horario: "horario" in req.body ? toDBHorario(req.body.horario) : undefined,
            },
        });
        res.json({
            ...updated,
            horario: fromDBHorario(updated.horario),
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error updating empleado:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
// DELETE /api/empleados/:id
r.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("empleado:delete"), async (req, res) => {
    try {
        await prisma_1.prisma.empleados.delete({
            where: { id_empleado: Number(req.params.id) },
        });
        res.status(204).end();
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            return res.status(400).json({
                error: "FK_CONSTRAINT",
                message: "No se puede eliminar el empleado porque tiene servicios o registros asociados."
            });
        }
        console.error("Error deleting empleado:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
exports.default = r;
