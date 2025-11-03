// src/routes/solicitudes.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

const r = Router();

// Listado con filtro por estado (espera / atendido) y búsqueda simple
r.get("/", auth, requirePerm("solicitud:list"), async (req, res) => {
  const estado = String(req.query.estado || ""); // "En espera" | "Atendido" | ""
  const q = String(req.query.q || "");

  const where: any = {};
  if (estado) where.estado = estado;

  if (q) {
    where.OR = [
      { codigo: { contains: q } },
      { cliente_nombre: { contains: q } },
      { dni: { contains: q } },
      { numero: { contains: q } },
      { servicio_solicitado: { contains: q } },
      { detalle: { contains: q } },
    ];
  }

  const rows = await prisma.solicitudes.findMany({
    where,
    orderBy: { creado_en: "desc" }
  });
  res.json(rows);
});

// Crear solicitud (público, no requiere auth)
r.post("/crear", async (req, res) => {
  try {
    const { nombre, correo, modelo, anio, numero, mensaje, detalle } = req.body;
    
    // Validar campos requeridos según el schema
    if (!nombre || !correo || !numero) {
      return res.status(400).json({ error: "nombre, correo y numero (teléfono) son requeridos" });
    }
    
    const created = await prisma.solicitudes.create({
      data: {
        nombre,
        correo,
        modelo: modelo || null,
        anio: anio ? Number(anio) : null,
        numero,
        mensaje: mensaje || detalle || null,
        detalle: detalle || mensaje || null,
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: "Error al crear solicitud", details: errorMessage });
  }
});

// Editar solicitud (cliente, dni, numero, servicio_solicitado, detalle, estado)
r.patch("/:id", auth, requirePerm("solicitud:update"), async (req, res) => {
  const updated = await prisma.solicitudes.update({
    where: { id_solicitud: Number(req.params.id) },
    data: req.body
  });
  res.json(updated);
});

// Eliminar solicitud
r.delete("/:id", auth, requirePerm("solicitud:update"), async (req, res) => {
  await prisma.solicitudes.delete({ where: { id_solicitud: Number(req.params.id) }});
  res.status(204).end();
});

export default r;
