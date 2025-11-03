"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auditoria.routes.ts
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const r = (0, express_1.Router)();
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
r.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("auditoria:view"), async (req, res) => {
    const { entidad, id_entidad, actor, desde, hasta, page = "1", pageSize = "20", } = req.query;
    const p = Math.max(1, parseInt(page));
    const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
    const where = {};
    if (entidad)
        where.entidad = entidad;
    if (id_entidad)
        where.id_entidad = id_entidad;
    if (actor)
        where.actor_usuario_id = Number(actor);
    if (desde || hasta) {
        where.creado_en = {};
        if (desde)
            where.creado_en.gte = new Date(desde);
        if (hasta)
            where.creado_en.lte = new Date(hasta + "T23:59:59");
    }
    const [total, rows] = await Promise.all([
        prisma_1.prisma.auditoria.count({ where }),
        prisma_1.prisma.auditoria.findMany({
            where,
            orderBy: { creado_en: "desc" },
            skip: (p - 1) * ps,
            take: ps
        })
    ]);
    res.json({ total, page: p, pageSize: ps, rows });
});
exports.default = r;
