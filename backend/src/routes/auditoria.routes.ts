// src/routes/auditoria.routes.ts
import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

const r = Router();

/**
 * GET /api/auditoria
 * Query params opcionales:
 *  - entidad: string
 *  - id_entidad: string
 *  - actor: number (id_usuario)
 *  - desde: YYYY-MM-DD
 *  - hasta: YYYY-MM-DD
 *  - page: number (1..)
 *  - pageSize: number (default 20)
 */
r.get("/", auth, requirePerm("auditoria:view"), async (req, res) => {
  const {
    entidad,
    id_entidad,
    actor,
    desde,
    hasta,
    page = "1",
    pageSize = "20",
  } = req.query as Record<string, string>;

  const p = Math.max(1, parseInt(page));
  const ps = Math.min(100, Math.max(1, parseInt(pageSize)));

  const where: any = {};
  if (entidad) where.entidad = entidad;
  if (id_entidad) where.id_entidad = id_entidad;
  if (actor) where.actor_usuario_id = Number(actor);
  if (desde || hasta) {
    where.creado_en = {};
    if (desde) where.creado_en.gte = new Date(desde);
    if (hasta) where.creado_en.lte = new Date(hasta + "T23:59:59");
  }

  const [total, rows] = await Promise.all([
    prisma.auditoria.count({ where }),
    prisma.auditoria.findMany({
      where,
      orderBy: { creado_en: "desc" },
      skip: (p - 1) * ps,
      take: ps
    })
  ]);

  res.json({ total, page: p, pageSize: ps, rows });
});

export default r;
