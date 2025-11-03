"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/serviciosActivos.routes.ts
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const generate_1 = require("../utils/generate");
const r = (0, express_1.Router)();
r.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.activo:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const data = await prisma_1.prisma.servicios_activos.findMany({
        where: q ? {
            OR: [
                { numero_seguimiento: { contains: q } },
                { cliente_nombre: { contains: q } },
                { placa: { contains: q } },
            ],
        } : undefined,
        orderBy: { created_at: "desc" }
    });
    res.json(data);
});
r.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.activo:create"), async (req, res) => {
    const { codigoCliente, placa, fecha, serviciosIds, observaciones } = req.body;
    const cliente = await prisma_1.prisma.clientes.findUnique({ where: { codigo: codigoCliente } });
    if (!cliente)
        return res.status(400).json({ error: "CLIENTE_NO_EXISTE" });
    const vehiculo = await prisma_1.prisma.vehiculos.findFirst({
        where: { placa, id_cliente: cliente.id_cliente }
    });
    if (!vehiculo)
        return res.status(400).json({ error: "VEHICULO_NO_EXISTE" });
    const numero = (0, generate_1.genSeguimiento)();
    const activo = await prisma_1.prisma.servicios_activos.create({
        data: {
            id_cliente: cliente.id_cliente,
            id_vehiculo: vehiculo.id_vehiculo,
            numero_seguimiento: numero,
            cliente_nombre: `${cliente.nombres} ${cliente.apellidos}`,
            placa,
            tipo: vehiculo.tipo,
            fecha,
            observaciones,
            created_by: req.user.uid
        }
    });
    if (Array.isArray(serviciosIds) && serviciosIds.length) {
        await prisma_1.prisma.detalle_servicio_activo.createMany({
            data: serviciosIds.map((id) => ({
                id_servicio_activo: activo.id_servicio_activo,
                id_servicio_catalogo: id
            })),
            skipDuplicates: true
        });
    }
    res.status(201).json(activo);
});
// Cambiar proceso/estado; si finaliza -> mover a concluidos
r.patch("/:id/proceso", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.activo:update"), async (req, res) => {
    const id = Number(req.params.id);
    const { proceso, observaciones } = req.body;
    const prev = await prisma_1.prisma.servicios_activos.findUnique({
        where: { id_servicio_activo: id }
    });
    if (!prev)
        return res.status(404).json({ error: "NO_EXISTE" });
    const fin = proceso === "Cierre del servicio";
    const updated = await prisma_1.prisma.servicios_activos.update({
        where: { id_servicio_activo: id },
        data: {
            proceso: proceso,
            estado: fin ? "Finalizado" : "En curso",
            observaciones: observaciones ?? prev.observaciones,
            updated_by: req.user.uid
        }
    });
    if (fin) {
        // 1) ids de servicios del detalle
        const detalles = await prisma_1.prisma.detalle_servicio_activo.findMany({
            where: { id_servicio_activo: id }
        });
        const srvIds = detalles.map(d => d.id_servicio_catalogo);
        // 2) nombres desde catálogo
        const srvCat = srvIds.length
            ? await prisma_1.prisma.servicios_catalogo.findMany({ where: { id_servicio: { in: srvIds } } })
            : [];
        const serviciosNombres = srvCat.map(s => s.nombre);
        // 3) registrar concluido y limpiar activo+detalle
        await prisma_1.prisma.servicios_concluidos.create({
            data: {
                id_cliente: prev.id_cliente,
                id_vehiculo: prev.id_vehiculo,
                cliente_nombre: prev.cliente_nombre,
                placa: prev.placa,
                tipo: prev.tipo,
                fecha: prev.fecha,
                servicios_json: JSON.stringify(serviciosNombres),
                observaciones: updated.observaciones ?? undefined,
            }
        });
        await prisma_1.prisma.detalle_servicio_activo.deleteMany({ where: { id_servicio_activo: id } });
        await prisma_1.prisma.servicios_activos.delete({ where: { id_servicio_activo: id } });
    }
    res.json({ ok: true });
});
exports.default = r;
