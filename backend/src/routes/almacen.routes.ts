import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";
import { z } from "zod";

const router = Router();

// Esquemas de validación
const ItemSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    descripcion: z.string().optional(),
    categoria: z.string().optional(),
    stock_minimo: z.number().nonnegative().optional().default(0),
    unidad_medida: z.string().optional().default("unidades"),
});

const MovimientoSchema = z.object({
    id_item: z.number().int(),
    tipo: z.enum(["ENTRADA", "SALIDA"]),
    cantidad: z.number().positive("La cantidad debe ser mayor a cero"),
    precio_unit: z.number().nonnegative().optional(),
    observacion: z.string().optional(),
});

// GET /api/almacen/items - Listar items
router.get("/items", auth, requirePerm("almacen:list"), async (req, res) => {
    try {
        const q = String(req.query.q || "");
        const items = await prisma.almacen_items.findMany({
            where: q ? {
                OR: [
                    { nombre: { contains: q } },
                    { categoria: { contains: q } },
                ]
            } : undefined,
            orderBy: { nombre: "asc" }
        });
        res.json(items);
    } catch (error) {
        console.error("Error listing almacen items:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});

// POST /api/almacen/items - Crear item
router.post("/items", auth, requirePerm("almacen:create"), async (req, res) => {
    try {
        const validatedData = ItemSchema.parse(req.body);
        const newItem = await prisma.almacen_items.create({
            data: validatedData
        });
        res.status(201).json(newItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error creating item:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});

// PUT /api/almacen/items/:id - Actualizar item
router.put("/items/:id", auth, requirePerm("almacen:update"), async (req, res) => {
    try {
        const id_item = Number(req.params.id);
        const validatedData = ItemSchema.partial().parse(req.body);

        const updatedItem = await prisma.almacen_items.update({
            where: { id_item },
            data: {
                ...validatedData,
                actualizado_en: new Date()
            }
        });
        res.json(updatedItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        console.error("Error updating item:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});

// POST /api/almacen/movimientos - Registrar movimiento (Entrada/Salida)
router.post("/movimientos", auth, requirePerm("almacen:update"), async (req, res) => {
    try {
        const validatedData = MovimientoSchema.parse(req.body);
        const { id_item, tipo, cantidad, precio_unit, observacion } = validatedData;

        const item = await prisma.almacen_items.findUnique({ where: { id_item } });
        if (!item) return res.status(404).json({ error: "ITEM_NOT_FOUND" });

        // Iniciar transacción para actualizar stock y registrar movimiento
        const result = await prisma.$transaction(async (tx) => {
            // 1. Registrar movimiento
            const mov = await tx.almacen_movimientos.create({
                data: {
                    id_item,
                    tipo,
                    cantidad,
                    precio_unit,
                    observacion,
                    id_usuario: (req as any).user.uid
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
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
        }
        if ((error as Error).message === "INSUFFICIENT_STOCK") {
            return res.status(400).json({ error: "INSUFFICIENT_STOCK", message: "No hay suficiente stock para esta salida." });
        }
        console.error("Error recording movement:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});

// GET /api/almacen/movimientos/:id_item - Historial por item
router.get("/movimientos/:id_item", auth, requirePerm("almacen:list"), async (req, res) => {
    try {
        const id_item = Number(req.params.id_item);
        const historial = await prisma.almacen_movimientos.findMany({
            where: { id_item },
            include: { usuarios: { select: { nombre_usuario: true } } },
            orderBy: { creado_en: "desc" }
        });
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});

export default router;
