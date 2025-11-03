// src/routes/empleados.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";
import { Prisma } from "@prisma/client";

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
  const body = req.body as any;

  // Generar código EMP###
  const count = await prisma.empleados.count();
  const codigo = `EMP${String(count + 1).padStart(3, "0")}`;

  const sueldo =
    body.sueldo === "" || body.sueldo == null
      ? undefined
      : new Prisma.Decimal(String(body.sueldo));

  const created = await prisma.empleados.create({
    data: {
      codigo,
      nombres: body.nombres,
      apellidos: body.apellidos,
      dni: body.dni || null,
      correo: body.correo || null,
      celular: body.celular || null,
      cargo: body.cargo || null,
      sueldo,
      horario: toDBHorario(body.horario) as any, // Ma_ana | Tarde | Ma_ana_y_Tarde
      estado: body.estado || "Activo",
      id_usuario: body.id_usuario ?? null,
    },
  });

  // devolver horario “bonito”
  res.status(201).json({
    ...created,
    horario: fromDBHorario(created.horario as any),
  });
});

// PUT /api/empleados/:id
r.put("/:id", auth, requirePerm("empleado:update"), async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body as any;

  const data: any = {};

  if ("nombres" in body) data.nombres = body.nombres;
  if ("apellidos" in body) data.apellidos = body.apellidos;
  if ("dni" in body) data.dni = body.dni ?? null;
  if ("correo" in body) data.correo = body.correo ?? null;
  if ("celular" in body) data.celular = body.celular ?? null;
  if ("cargo" in body) data.cargo = body.cargo ?? null;
  if ("estado" in body) data.estado = body.estado ?? "Activo";
  if ("horario" in body) data.horario = toDBHorario(body.horario) as any;
  if ("sueldo" in body) {
    data.sueldo =
      body.sueldo === "" || body.sueldo == null
        ? null
        : new Prisma.Decimal(String(body.sueldo));
  }
  if ("id_usuario" in body) data.id_usuario = body.id_usuario ?? null;

  const updated = await prisma.empleados.update({
    where: { id_empleado: id },
    data,
  });

  res.json({
    ...updated,
    horario: fromDBHorario(updated.horario as any),
  });
});

// DELETE /api/empleados/:id
r.delete("/:id", auth, requirePerm("empleado:delete"), async (req, res) => {
  await prisma.empleados.delete({
    where: { id_empleado: Number(req.params.id) },
  });
  res.status(204).end();
});

export default r;
