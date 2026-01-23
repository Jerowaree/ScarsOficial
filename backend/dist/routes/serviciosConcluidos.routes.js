"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/serviciosConcluidos.routes.ts
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const r = (0, express_1.Router)();
// Listar servicios concluidos
r.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.activo:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const data = await prisma_1.prisma.servicios_concluidos.findMany({
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
exports.default = r;
