"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const auth_1 = require("../middlewares/auth");
const requirePerm_1 = require("../middlewares/requirePerm");
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
    const { nombre, descripcion, estado } = req.body;
    let tipo_media = null;
    let url_media = null;
    if (req.file) {
        const ext = path_1.default.extname(req.file.filename).toLowerCase();
        tipo_media = [".mp4", ".webm"].includes(ext) ? "video" : "imagen";
        url_media = `/uploads/${req.file.filename}`;
    }
    else if (req.body.url_video) {
        tipo_media = "video";
        url_media = req.body.url_video;
    }
    const count = await prisma_1.prisma.servicios_catalogo.count();
    const codigo = `SERV${String(count + 1).padStart(3, "0")}`;
    const created = await prisma_1.prisma.servicios_catalogo.create({
        data: { codigo, nombre, descripcion, estado, tipo_media, url_media },
    });
    res.status(201).json(created);
});
/* 🔹 Actualizar campos (nombre/descripcion/estado) */
router.put("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:manage"), async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, descripcion, estado } = req.body;
    const payload = {};
    if (typeof nombre === "string")
        payload.nombre = nombre;
    if (typeof descripcion !== "undefined")
        payload.descripcion = descripcion;
    if (typeof estado === "string")
        payload.estado = estado; // ya mapeas en el frontend
    const updated = await prisma_1.prisma.servicios_catalogo.update({
        where: { id_servicio: id },
        data: payload,
    });
    res.json(updated);
});
/* 🔹 Actualizar/quitar media */
router.put("/:id/media", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:manage"), upload.single("media"), async (req, res) => {
    const id = Number(req.params.id);
    let tipo_media = null;
    let url_media = null;
    if (req.body.remove_media === "1") {
        // quitar media
        tipo_media = null;
        url_media = null;
    }
    else if (req.file) {
        const ext = path_1.default.extname(req.file.filename).toLowerCase();
        tipo_media = [".mp4", ".webm"].includes(ext) ? "video" : "imagen";
        url_media = `/uploads/${req.file.filename}`;
    }
    else if (req.body.url_video) {
        tipo_media = "video";
        url_media = req.body.url_video;
    }
    else {
        // nada enviado => no cambiar
        const current = await prisma_1.prisma.servicios_catalogo.findUnique({ where: { id_servicio: id } });
        return res.json(current);
    }
    const updated = await prisma_1.prisma.servicios_catalogo.update({
        where: { id_servicio: id },
        data: { tipo_media, url_media },
    });
    res.json(updated);
});
/* Eliminar (permiso manage) */
router.delete("/:id", auth_1.auth, (0, requirePerm_1.requirePerm)("servicio.catalogo:manage"), async (req, res) => {
    await prisma_1.prisma.servicios_catalogo.delete({ where: { id_servicio: Number(req.params.id) } });
    res.status(204).end();
});
exports.default = router;
