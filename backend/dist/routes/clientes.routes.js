"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const ClienteSchema = zod_1.z.object({
    codigo: zod_1.z.string().optional(),
    nombres: zod_1.z.string().min(1, "Nombres requeridos"),
    apellidos: zod_1.z.string().min(1, "Apellidos requeridos"),
    dni: zod_1.z.string().max(8, "DNI muy largo").optional().nullable(),
    ruc: zod_1.z.string().max(11, "RUC muy largo").optional().nullable(),
    genero: zod_1.z.enum(["Masculino", "Femenino", "No_especificado"]).optional().nullable(),
    correo: zod_1.z.string().email("Correo inválido").or(zod_1.z.literal("")).optional().nullable(),
    celular: zod_1.z.string().max(15).optional().nullable(),
    direccion: zod_1.z.string().max(200).optional().nullable(),
    fecha_nacimiento: zod_1.z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});
router.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const where = q ? {
        OR: [
            { codigo: { contains: q } },
            { nombres: { contains: q } },
            { apellidos: { contains: q } },
            { correo: { contains: q } },
            { celular: { contains: q } },
        ]
    } : undefined;
    const data = await prisma_1.prisma.clientes.findMany({ where, orderBy: { fecha_registro: "desc" } });
    res.json(data);
});
router.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:create"), async (req, res) => {
    try {
        const validatedData = ClienteSchema.parse(req.body);
        // Si no viene código, lo generamos
        let codigo = validatedData.codigo;
        if (!codigo) {
            const count = await prisma_1.prisma.clientes.count();
            codigo = `C${(count + 1).toString().padStart(5, '0')}`;
        }
        const created = await prisma_1.prisma.clientes.create({
            data: { ...validatedData, codigo }
        });
        res.status(201).json(created);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error creating cliente:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
router.post("/with-vehiculo", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:create", "vehiculo:create"), async (req, res) => {
    try {
        const { cliente, vehiculo } = req.body;
        // Validar cliente
        const validatedCliente = ClienteSchema.parse(cliente);
        // Generar código si falta
        if (!validatedCliente.codigo) {
            const count = await prisma_1.prisma.clientes.count();
            validatedCliente.codigo = `C${(count + 1).toString().padStart(5, '0')}`;
        }
        const out = await prisma_1.prisma.$transaction(async (tx) => {
            const c = await tx.clientes.create({ data: validatedCliente });
            // Solo crear vehículo si viene placa y no está vacío
            if (vehiculo && vehiculo.placa && vehiculo.placa.trim() !== "") {
                await tx.vehiculos.create({
                    data: { ...vehiculo, id_cliente: c.id_cliente }
                });
            }
            return c;
        });
        res.status(201).json(out);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        // Manejar errores de clave duplicada de Prisma (Placa, Código, etc.)
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const targets = error.meta?.target || [];
            if (targets.includes("placa")) {
                return res.status(400).json({ error: "DUPLICATE_ERROR", message: "La placa del vehículo ya está registrada en el sistema." });
            }
            if (targets.includes("codigo")) {
                return res.status(400).json({ error: "DUPLICATE_ERROR", message: "El código de cliente ya existe." });
            }
            return res.status(400).json({ error: "DUPLICATE_ERROR", message: "Error de duplicidad en los datos enviados." });
        }
        console.error("Error creating cliente with vehiculo:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
});
router.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:update"), async (req, res) => {
    try {
        const validatedData = ClienteSchema.partial().parse(req.body);
        const updated = await prisma_1.prisma.clientes.update({
            where: { id_cliente: Number(req.params.id) },
            data: validatedData
        });
        res.json(updated);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return res.status(400).json({ error: "DUPLICATE_ERROR", message: "Ya existe un registro con esos datos (DNI/Correo/Código)." });
        }
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
router.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:delete"), async (req, res) => {
    try {
        await prisma_1.prisma.clientes.delete({ where: { id_cliente: Number(req.params.id) } });
        res.status(204).end();
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            return res.status(400).json({
                error: "FK_CONSTRAINT",
                message: "No se puede eliminar el cliente porque tiene vehículos o historial de servicios asociado."
            });
        }
        console.error("Error deleting cliente:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "Error interno al eliminar cliente" });
    }
});
exports.default = router;
