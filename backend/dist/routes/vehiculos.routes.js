"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const router = (0, express_1.Router)();
router.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const where = q ? {
        OR: [
            { placa: { contains: q } },
            { marca: { contains: q } },
            { modelo: { contains: q } }
        ]
    } : undefined;
    const data = await prisma_1.prisma.vehiculos.findMany({ where, orderBy: { id_vehiculo: "desc" } });
    res.json(data);
});
router.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:create"), async (req, res) => {
    const { codigoCliente, ...veh } = req.body;
    const cliente = await prisma_1.prisma.clientes.findUnique({ where: { codigo: codigoCliente } });
    if (!cliente)
        return res.status(400).json({ error: "CLIENTE_NO_EXISTE" });
    const created = await prisma_1.prisma.vehiculos.create({
        data: { ...veh, id_cliente: cliente.id_cliente }
    });
    res.status(201).json(created);
});
router.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:update"), async (req, res) => {
    const updated = await prisma_1.prisma.vehiculos.update({
        where: { id_vehiculo: Number(req.params.id) },
        data: req.body
    });
    res.json(updated);
});
router.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("vehiculo:delete"), async (req, res) => {
    await prisma_1.prisma.vehiculos.delete({ where: { id_vehiculo: Number(req.params.id) } });
    res.status(204).end();
});
exports.default = router;
