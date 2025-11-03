"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const router = (0, express_1.Router)();
router.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:list"), async (req, res) => {
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
    const data = await prisma_1.prisma.clientes.findMany({ where, orderBy: { fecha_registro: "desc" } });
    res.json(data);
});
router.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:create"), async (req, res) => {
    const created = await prisma_1.prisma.clientes.create({ data: req.body });
    res.status(201).json(created);
});
router.post("/with-vehiculo", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:create", "vehiculo:create"), async (req, res) => {
    const { cliente, vehiculo } = req.body;
    const out = await prisma_1.prisma.$transaction(async (tx) => {
        const c = await tx.clientes.create({ data: cliente });
        await tx.vehiculos.create({ data: { ...vehiculo, id_cliente: c.id_cliente } });
        return c;
    });
    res.status(201).json(out);
});
router.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:update"), async (req, res) => {
    const updated = await prisma_1.prisma.clientes.update({
        where: { id_cliente: Number(req.params.id) },
        data: req.body
    });
    res.json(updated);
});
router.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("cliente:delete"), async (req, res) => {
    await prisma_1.prisma.clientes.delete({ where: { id_cliente: Number(req.params.id) } });
    res.status(204).end();
});
exports.default = router;
