"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const VehiculoSchema = zod_1.z.object({
    placa: zod_1.z.string().min(1).max(10),
    tipo: zod_1.z.enum(["Automovil", "Moto"]),
    marca: zod_1.z.string().nullable().optional(),
    modelo: zod_1.z.string().nullable().optional(),
    anio: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(v => parseInt(v))]).nullable().optional(),
    color: zod_1.z.string().nullable().optional(),
    id_cliente: zod_1.z.union([
        zod_1.z.number(),
        zod_1.z.string().transform(v => v === "" ? undefined : parseInt(v))
    ]).optional(),
});
router.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const where = q ? {
        OR: [
            { placa: { contains: q } },
            { marca: { contains: q } },
            { modelo: { contains: q } }
        ]
    } : undefined;
    const data = await prisma_1.prisma.vehiculos.findMany({ where, orderBy: { id_vehiculo: "desc" } });
    res.json(data);
});
router.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:create"), async (req, res) => {
    try {
        const { codigoCliente, ...rest } = req.body;
        const validatedData = VehiculoSchema.parse(rest);
        let id_cliente = validatedData.id_cliente;
        if (codigoCliente) {
            const cliente = await prisma_1.prisma.clientes.findUnique({ where: { codigo: codigoCliente } });
            if (!cliente)
                return res.status(400).json({ error: "CLIENTE_NO_EXISTE" });
            id_cliente = cliente.id_cliente;
        }
        if (!id_cliente)
            return res.status(400).json({ error: "CLIENTE_REQUERIDO" });
        const created = await prisma_1.prisma.vehiculos.create({
            data: {
                placa: validatedData.placa,
                tipo: validatedData.tipo,
                marca: validatedData.marca,
                modelo: validatedData.modelo,
                anio: validatedData.anio,
                color: validatedData.color,
                id_cliente: id_cliente
            }
        });
        res.status(201).json(created);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
router.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:update"), async (req, res) => {
    try {
        const validatedData = VehiculoSchema.partial().parse(req.body);
        const updated = await prisma_1.prisma.vehiculos.update({
            where: { id_vehiculo: Number(req.params.id) },
            data: {
                ...validatedData,
                id_cliente: validatedData.id_cliente ?? undefined
            }
        });
        res.json(updated);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
router.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:delete"), async (req, res) => {
    try {
        await prisma_1.prisma.vehiculos.delete({ where: { id_vehiculo: Number(req.params.id) } });
        res.status(204).end();
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            return res.status(400).json({
                error: "FK_CONSTRAINT",
                message: "No se puede eliminar el vehículo porque tiene servicios asociados."
            });
        }
        console.error("Error deleting vehiculo:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
exports.default = router;
