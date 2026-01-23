"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `srv_${Date.now()}${path_1.default.extname(file.originalname)}`),
});
const upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
/* Listar (permiso) */
router.get("/", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:list"), async (req, res) => {
    const q = String(req.query.q || "");
    const where = q
        ? { OR: [{ codigo: { contains: q } }, { nombre: { contains: q } }, { descripcion: { contains: q } }] }
        : undefined;
    const rows = await prisma_1.prisma.servicios_catalogo.findMany({
        where,
        orderBy: { creado_en: "desc" },
    });
    res.json(rows);
});
/* Crear (permiso manage) */
router.post("/", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:manage"), upload.single("media"), async (req, res) => {
    const { nombre, descripcion, estado, precio } = req.body;
    const count = await prisma_1.prisma.servicios_catalogo.count();
    const codigo = `SERV${String(count + 1).padStart(3, "0")}`;
    const created = await prisma_1.prisma.servicios_catalogo.create({
        data: { nombre, descripcion, estado, precio: parseFloat(precio) || 0, },
    });
    res.status(201).json(created);
});
/* 🔹 Actualizar campos (nombre/descripcion/estado) */
router.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:manage"), async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, descripcion, estado, precio } = req.body;
    const payload = {};
    if (typeof nombre === "string")
        payload.nombre = nombre;
    if (typeof descripcion !== "undefined")
        payload.descripcion = descripcion;
    if (typeof estado === "string")
        payload.estado = estado;
    if (typeof precio !== "undefined")
        payload.precio = parseFloat(precio) || 0;
    const updated = await prisma_1.prisma.servicios_catalogo.update({
        where: { id_servicio: id },
        data: payload,
    });
    res.json(updated);
});
/* Eliminar (permiso manage) */
router.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:manage"), async (req, res) => {
    try {
        await prisma_1.prisma.servicios_catalogo.delete({ where: { id_servicio: Number(req.params.id) } });
        res.status(204).end();
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            return res.status(400).json({
                error: "FK_CONSTRAINT",
                message: "No se puede eliminar este servicio del catálogo porque ha sido utilizado en órdenes de servicio."
            });
        }
        console.error("Error deleting servicio catalogo:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
});
exports.default = router;
