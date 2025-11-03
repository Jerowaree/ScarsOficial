// src/routes/serviciosConcluidos.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

const r = Router();

// Listar servicios concluidos
r.get("/", auth, requirePerm("servicio.activo:list"), async (req, res) => {
  const q = String(req.query.q || "");
  const data = await prisma.servicios_concluidos.findMany({
    where: q ? {
      OR: [
        { placa: { contains: q } },
        { cliente_nombre: { contains: q } },
      ],
    } : undefined,
    orderBy: { fecha: "desc" }
  });
  res.json(data);
});

export default r;




