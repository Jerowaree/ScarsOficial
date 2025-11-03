import { Router } from "express";
import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";

const router = Router();

router.get("/", auth, requirePerm("cliente:list"), async (req, res) => {
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

  const data = await prisma.clientes.findMany({ where, orderBy: { fecha_registro: "desc" } });
  res.json(data);
});

router.post("/", auth, requirePerm("cliente:create"), async (req, res) => {
  const created = await prisma.clientes.create({ data: req.body });
  res.status(201).json(created);
});

router.post("/with-vehiculo", auth, requirePerm("cliente:create","vehiculo:create"), async (req, res) => {
  const { cliente, vehiculo } = req.body as { cliente: any; vehiculo: any };

  const out = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const c = await tx.clientes.create({ data: cliente });
    await tx.vehiculos.create({ data: { ...vehiculo, id_cliente: c.id_cliente } });
    return c;
  });

  res.status(201).json(out);
});

router.put("/:id", auth, requirePerm("cliente:update"), async (req, res) => {
  const updated = await prisma.clientes.update({
    where: { id_cliente: Number(req.params.id) },
    data: req.body
  });
  res.json(updated);
});

router.delete("/:id", auth, requirePerm("cliente:delete"), async (req, res) => {
  await prisma.clientes.delete({ where: { id_cliente: Number(req.params.id) }});
  res.status(204).end();
});

export default router;
