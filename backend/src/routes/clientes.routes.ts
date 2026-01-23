import { Router } from "express";
import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

import { z } from "zod";

const router = Router();

const ClienteSchema = z.object({
  codigo: z.string().optional(),
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidos: z.string().min(1, "Apellidos requeridos"),
  dni: z.string().max(8, "DNI muy largo").optional().nullable(),
  ruc: z.string().max(11, "RUC muy largo").optional().nullable(),
  genero: z.enum(["Masculino", "Femenino", "No_especificado"]).optional().nullable(),
  correo: z.string().email("Correo inválido").or(z.literal("")).optional().nullable(),
  celular: z.string().max(15).optional().nullable(),
  direccion: z.string().max(200).optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});

router.get("/", auth, requirePerm("cliente:list"), async (req, res) => {
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

  const data = await prisma.clientes.findMany({ where, orderBy: { fecha_registro: "desc" } });
  res.json(data);
});

router.post("/", auth, requirePerm("cliente:create"), async (req, res) => {
  try {
    const validatedData = ClienteSchema.parse(req.body);

    // Si no viene código, lo generamos
    let codigo = validatedData.codigo;
    if (!codigo) {
      const count = await prisma.clientes.count();
      codigo = `C${(count + 1).toString().padStart(5, '0')}`;
    }

    const created = await prisma.clientes.create({
      data: { ...validatedData, codigo }
    });
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    }
    console.error("Error creating cliente:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

router.post("/with-vehiculo", auth, requirePerm("cliente:create", "vehiculo:create"), async (req, res) => {
  try {
    const { cliente, vehiculo } = req.body;

    // Validar cliente
    const validatedCliente = ClienteSchema.parse(cliente);

    // Generar código si falta
    if (!validatedCliente.codigo) {
      const count = await prisma.clientes.count();
      validatedCliente.codigo = `C${(count + 1).toString().padStart(5, '0')}`;
    }

    const out = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const c = await tx.clientes.create({ data: validatedCliente as any });

      // Solo crear vehículo si viene placa y no está vacío
      if (vehiculo && vehiculo.placa && vehiculo.placa.trim() !== "") {
        await tx.vehiculos.create({
          data: { ...vehiculo, id_cliente: c.id_cliente }
        });
      }
      return c;
    });

    res.status(201).json(out);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    }

    // Manejar errores de clave duplicada de Prisma (Placa, Código, etc.)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const targets = (error.meta?.target as string[]) || [];
      if (targets.includes("placa")) {
        return res.status(400).json({ error: "DUPLICATE_ERROR", message: "La placa del vehículo ya está registrada en el sistema." });
      }
      if (targets.includes("codigo")) {
        return res.status(400).json({ error: "DUPLICATE_ERROR", message: "El código de cliente ya existe." });
      }
      return res.status(400).json({ error: "DUPLICATE_ERROR", message: "Error de duplicidad en los datos enviados." });
    }

    console.error("Error creating cliente with vehiculo:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: (error as Error).message });
  }
});

router.put("/:id", auth, requirePerm("cliente:update"), async (req, res) => {
  try {
    const validatedData = ClienteSchema.partial().parse(req.body);
    const updated = await prisma.clientes.update({
      where: { id_cliente: Number(req.params.id) },
      data: validatedData
    });
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ error: "DUPLICATE_ERROR", message: "Ya existe un registro con esos datos (DNI/Correo/Código)." });
    }

    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

router.delete("/:id", auth, requirePerm("cliente:delete"), async (req, res) => {
  await prisma.clientes.delete({ where: { id_cliente: Number(req.params.id) } });
  res.status(204).end();
});

export default router;
