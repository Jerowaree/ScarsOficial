import { Router } from "express";
import { prisma } from "../db/prisma";
import { auth } from "../middlewares/auth";
import { requirePerm } from "../middlewares/requirePerm";
import { Prisma } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `srv_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

const router = Router();

/* Listar (permiso) */
router.get("/", auth, requirePerm("servicio.catalogo:list"), async (req, res) => {
  const q = String(req.query.q || "");
  const where = q
    ? { OR: [{ codigo: { contains: q } }, { nombre: { contains: q } }, { descripcion: { contains: q } }] }
    : undefined;

  const rows = await prisma.servicios_catalogo.findMany({
    where,
    orderBy: { creado_en: "desc" },
  });
  res.json(rows);
});

/* Crear (permiso manage) */
router.post("/", auth, requirePerm("servicio.catalogo:manage"), upload.single("media"), async (req, res) => {
  const { nombre, descripcion, estado, precio } = req.body as any;

  const count = await prisma.servicios_catalogo.count();
  const codigo = `SERV${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.servicios_catalogo.create({
    data: { nombre, descripcion, estado, precio: parseFloat(precio) || 0, },
  });
  res.status(201).json(created);
});

/* 🔹 Actualizar campos (nombre/descripcion/estado) */
router.put("/:id", auth, requirePerm("servicio.catalogo:manage"), async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, descripcion, estado, precio } = req.body as any;

  const payload: any = {};
  if (typeof nombre === "string") payload.nombre = nombre;
  if (typeof descripcion !== "undefined") payload.descripcion = descripcion;
  if (typeof estado === "string") payload.estado = estado;
  if (typeof precio !== "undefined") payload.precio = parseFloat(precio) || 0;

  const updated = await prisma.servicios_catalogo.update({
    where: { id_servicio: id },
    data: payload,
  });
  res.json(updated);
});


/* Eliminar (permiso manage) */
router.delete("/:id", auth, requirePerm("servicio.catalogo:manage"), async (req, res) => {
  try {
    await prisma.servicios_catalogo.delete({ where: { id_servicio: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return res.status(400).json({
        error: "FK_CONSTRAINT",
        message: "No se puede eliminar este servicio del catálogo porque ha sido utilizado en órdenes de servicio."
      });
    }
    console.error("Error deleting servicio catalogo:", error);
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
});

export default router;
