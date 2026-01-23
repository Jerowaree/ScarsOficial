"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Esquemas de validación
const ItemSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, "El nombre es obligatorio"),
    descripcion: zod_1.z.string().optional(),
    categoria: zod_1.z.string().optional(),
    stock_minimo: zod_1.z.number().nonnegative().optional().default(0),
    unidad_medida: zod_1.z.string().optional().default("unidades"),
});
const MovimientoSchema = zod_1.z.object({
    id_item: zod_1.z.number().int(),
    tipo: zod_1.z.enum(["ENTRADA", "SALIDA"]),
    cantidad: zod_1.z.number().positive("La cantidad debe ser mayor a cero"),
    precio_unit: zod_1.z.number().nonnegative().optional(),
    observacion: zod_1.z.string().optional(),
});
// GET /api/almacen/items - Listar items
router.get("/items", auth_1.auth, (0, requirePerm_1.requirePerm)("almacen:list"), async (req, res) => {
    try {
        const q = String(req.query.q || "");
        const items = await prisma_1.prisma.almacen_items.findMany({
            where: q ? {
                OR: [
                    { nombre: { contains: q } },
                    { categoria: { contains: q } },
                ]
            } : undefined,
            orderBy: { nombre: "asc" }
        });
        res.json(items);
    }
    catch (error) {
        console.error("Error listing almacen items:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
// POST /api/almacen/items - Crear item
router.post("/items", auth_1.auth, (0, requirePerm_1.requirePerm)("almacen:create"), async (req, res) => {
    try {
        const validatedData = ItemSchema.parse(req.body);
        const newItem = await prisma_1.prisma.almacen_items.create({
            data: validatedData
        });
        res.status(201).json(newItem);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error creating item:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
// PUT /api/almacen/items/:id - Actualizar item
router.put("/items/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("almacen:update"), async (req, res) => {
    try {
        const id_item = Number(req.params.id);
        const validatedData = ItemSchema.partial().parse(req.body);
        const updatedItem = await prisma_1.prisma.almacen_items.update({
            where: { id_item },
            data: {
                ...validatedData,
                actualizado_en: new Date()
            }
        });
        res.json(updatedItem);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error updating item:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
// POST /api/almacen/movimientos - Registrar movimiento (Entrada/Salida)
router.post("/movimientos", auth_1.auth, (0, requirePerm_1.requirePerm)("almacen:update"), async (req, res) => {
    try {
        const validatedData = MovimientoSchema.parse(req.body);
        const { id_item, tipo, cantidad, precio_unit, observacion } = validatedData;
        const item = await prisma_1.prisma.almacen_items.findUnique({ where: { id_item } });
        if (!item)
            return res.status(404).json({ error: "ITEM_NOT_FOUND" });
        // Iniciar transacción para actualizar stock y registrar movimiento
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Registrar movimiento
            const mov = await tx.almacen_movimientos.create({
                data: {
                    id_item,
                    tipo,
                    cantidad,
                    precio_unit,
                    observacion,
                    id_usuario: req.user.uid
                }
            });
            // 2. Calcular nuevo stock
            const stockChange = tipo === "ENTRADA" ? cantidad : -cantidad;
            const nuevoStock = Number(item.stock_actual) + stockChange;
            if (nuevoStock < 0) {
                throw new Error("INSUFFICIENT_STOCK");
            }
            // 3. Actualizar item
            return await tx.almacen_items.update({
                where: { id_item },
                data: {
                    stock_actual: nuevoStock,
                    // Si es entrada, actualizar precio promedio opcionalmente
                    ...(tipo === "ENTRADA" && precio_unit ? { precio_promedio: precio_unit } : {})
                }
            });
        });
        res.json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        if (error.message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({ error: "INSUFFICIENT_STOCK", message: "No hay suficiente stock para esta salida." });
        }
        console.error("Error recording movement:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
// GET /api/almacen/movimientos/:id_item - Historial por item
router.get("/movimientos/:id_item", auth_1.auth, (0, requirePerm_1.requirePerm)("almacen:list"), async (req, res) => {
    try {
        const id_item = Number(req.params.id_item);
        const historial = await prisma_1.prisma.almacen_movimientos.findMany({
            where: { id_item },
            include: { usuarios: { select: { nombre_usuario: true } } },
            orderBy: { creado_en: "desc" }
        });
        res.json(historial);
    }
    catch (error) {
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
exports.default = router;
