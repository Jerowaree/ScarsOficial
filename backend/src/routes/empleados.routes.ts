// src/routes/empleados.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const r = Router();

// Helpers: mapear horario UI <-> DB
const toDBHorario = (h?: string | null) => {
  if (!h) return undefined;
  if (h === "Mañana") return "Ma_ana";
  if (h === "Mañana y Tarde") return "Ma_ana_y_Tarde";
  if (h === "Tarde") return "Tarde";
  return undefined;
};
const fromDBHorario = (h?: string | null) => {
  if (h === "Ma_ana") return "Mañana";
  if (h === "Ma_ana_y_Tarde") return "Mañana y Tarde";
  if (h === "Tarde") return "Tarde";
  return null;
};

const EmpleadoSchema = z.object({
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidos: z.string().min(1, "Apellidos requeridos"),
  dni: z.string().max(8).optional().nullable(),
  correo: z.string().email("Correo inválido").or(z.literal("")).optional().nullable(),
  celular: z.string().max(15).optional().nullable(),
  cargo: z.string().max(100).optional().nullable(),
  sueldo: z.union([z.number(), z.string(), z.instanceof(Prisma.Decimal)]).optional().nullable().transform(val =>
    (val === "" || val == null) ? null : new Prisma.Decimal(String(val))
  ),
  horario: z.enum(["Mañana", "Tarde", "Mañana y Tarde"]).optional().nullable().transform(toDBHorario),
  estado: z.enum(["Activo", "Inactivo"]).optional().nullable(),
  id_usuario: z.number().optional().nullable(),
});

// GET /api/empleados?q=
r.get("/", auth, requirePerm("empleado:list"), async (req, res) => {
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

  const rows = await prisma.empleados.findMany({
    where,
    orderBy: { id_empleado: "desc" },
  });

  // Normalizamos horario para UI
  const data = rows.map((e) => ({
    ...e,
    horario: fromDBHorario(e.horario as any),
  }));

  res.json(data);
});

// POST /api/empleados
r.post("/", auth, requirePerm("empleado:create"), async (req, res) => {
  try {
    const validatedData = EmpleadoSchema.parse(req.body);

    // Generar código EMP###
    const count = await prisma.empleados.count();
    const codigo = `EMP${String(count + 1).padStart(3, "0")}`;

    const created = await prisma.empleados.create({
      data: {
        ...validatedData,
        codigo,
        horario: validatedData.horario as any,
        sueldo: validatedData.sueldo as any,
      },
    });

    res.status(201).json({
      ...created,
      horario: fromDBHorario(created.horario as any),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    }
    console.error("Error creating empleado:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

// PUT /api/empleados/:id
r.put("/:id", auth, requirePerm("empleado:update"), async (req, res) => {
  try {
    const validatedData = EmpleadoSchema.partial().parse(req.body);

    const updated = await prisma.empleados.update({
      where: { id_empleado: Number(req.params.id) },
      data: {
        ...validatedData,
        horario: "horario" in req.body ? toDBHorario(req.body.horario) : undefined,
      } as any,
    });

    res.json({
      ...updated,
      horario: fromDBHorario(updated.horario as any),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: error.issues });
    }
    console.error("Error updating empleado:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

// DELETE /api/empleados/:id
r.delete("/:id", auth, requirePerm("empleado:delete"), async (req, res) => {
  try {
    await prisma.empleados.delete({
      where: { id_empleado: Number(req.params.id) },
    });
    res.status(204).end();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return res.status(400).json({
        error: "FK_CONSTRAINT",
        message: "No se puede eliminar el empleado porque tiene servicios o registros asociados."
      });
    }
    console.error("Error deleting empleado:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

export default r;

