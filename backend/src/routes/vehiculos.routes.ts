import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

const router = Router();

router.get("/", auth, requirePerm("vehiculo:list"), async (req, res) => {
  const q = String(req.query.q || "");
  const where = q ? {
    OR: [
      { placa: { contains: q } },
      { marca: { contains: q } },
      { modelo: { contains: q } }
    ]
  } : undefined;

  const data = await prisma.vehiculos.findMany({ where, orderBy: { id_vehiculo: "desc" } });
  res.json(data);
});

router.post("/", auth, requirePerm("vehiculo:create"), async (req, res) => {
  const { codigoCliente, ...veh } = req.body as any;
  const cliente = await prisma.clientes.findUnique({ where: { codigo: codigoCliente }});
  if (!cliente) return res.status(400).json({ error: "CLIENTE_NO_EXISTE" });

  const created = await prisma.vehiculos.create({
    data: { ...veh, id_cliente: cliente.id_cliente }
  });
  res.status(201).json(created);
});

router.put("/:id", auth, requirePerm("vehiculo:update"), async (req, res) => {
  const updated = await prisma.vehiculos.update({
    where: { id_vehiculo: Number(req.params.id) },
    data: req.body
  });
  res.json(updated);
});

router.delete("/:id", auth, requirePerm("vehiculo:delete"), async (req, res) => {
  await prisma.vehiculos.delete({ where: { id_vehiculo: Number(req.params.id) }});
  res.status(204).end();
});

export default router;
