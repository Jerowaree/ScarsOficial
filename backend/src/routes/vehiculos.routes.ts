import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

import { z } from "zod";

const router = Router();

const VehiculoSchema = z.object({
  placa: z.string().min(1).max(10),
  tipo: z.enum(["Automovil", "Moto"]),
  marca: z.string().nullable().optional(),
  modelo: z.string().nullable().optional(),
  anio: z.union([z.number(), z.string().transform(v => parseInt(v))]).nullable().optional(),
  color: z.string().nullable().optional(),
  id_cliente: z.union([
    z.number(),
    z.string().transform(v => v === "" ? undefined : parseInt(v))
  ]).optional(),
});

router.get("/", auth, requirePerm("vehiculo:list"), async (req, res) => {
  const q = String(req.query.q || "");
  const where = q ? {
    OR: [
      { placa: { contains: q } },
      { marca: { contains: q } },
      { modelo: { contains: q } }
    ]
  } : undefined;

  const data = await prisma.vehiculos.findMany({ where, orderBy: { id_vehiculo: "desc" } });
  res.json(data);
});

router.post("/", auth, requirePerm("vehiculo:create"), async (req, res) => {
  try {
    const { codigoCliente, ...rest } = req.body;
    const validatedData = VehiculoSchema.parse(rest);

    let id_cliente = validatedData.id_cliente;

    if (codigoCliente) {
      const cliente = await prisma.clientes.findUnique({ where: { codigo: codigoCliente } });
      if (!cliente) return res.status(400).json({ error: "CLIENTE_NO_EXISTE" });
      id_cliente = cliente.id_cliente;
    }

    if (!id_cliente) return res.status(400).json({ error: "CLIENTE_REQUERIDO" });

    const created = await prisma.vehiculos.create({
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
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

router.put("/:id", auth, requirePerm("vehiculo:update"), async (req, res) => {
  try {
    const validatedData = VehiculoSchema.partial().parse(req.body);
    const updated = await prisma.vehiculos.update({
      where: { id_vehiculo: Number(req.params.id) },
      data: {
        ...validatedData,
        id_cliente: validatedData.id_cliente ?? undefined
      } as any
    });
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

router.delete("/:id", auth, requirePerm("vehiculo:delete"), async (req, res) => {
  await prisma.vehiculos.delete({ where: { id_vehiculo: Number(req.params.id) } });
  res.status(204).end();
});

export default router;
