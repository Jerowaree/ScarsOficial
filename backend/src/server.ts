// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth.routes";
import clientesRoutes from "./routes/clientes.routes";
import vehiculosRoutes from "./routes/vehiculos.routes";
import catalogoRoutes from "./routes/serviciosCatalogo.routes";
import activosRoutes from "./routes/serviciosActivos.routes";
import concluidosRoutes from "./routes/serviciosConcluidos.routes";
import solicitudesRoutes from "./routes/solicitudes.routes";
import auditoriaRoutes from "./routes/auditoria.routes";
import empleadosRoutes from "./routes/empleados.routes";
import seguimientoRoutes from "./routes/seguimiento.routes";
import chatbotRoutes from "./routes/chatbot.routes";
import almacenRoutes from "./routes/almacen.routes";
import usuariosRoutes from "./routes/usuarios.routes";

import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { Prisma } from "@prisma/client";

// Global JSON serialization fix for BigInt and Decimal
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
(Prisma.Decimal.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();

// 1. Restricted CORS (Debe ir primero para manejar preflight OPTIONS)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    process.env.FRONTEND_URL || "https://scars.vercel.app",
    "https://www.scars.com.pe",
    // Allow preview deployments
    /^https:\/\/scars.*\.vercel\.app$/
  ]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true
}));

// 2. Security Headers
app.use(helmet());

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for development/hot-reloading
  message: {
    status: 429,
    message: "Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser()); // Middleware para parsear cookies
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/servicios/catalogo", catalogoRoutes);
app.use("/api/servicios/activos", activosRoutes);
app.use("/api/servicios/concluidos", concluidosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/seguimiento", seguimientoRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/almacen", almacenRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.listen(process.env.PORT || 4000, () =>
  console.log(`API on :${process.env.PORT || 4000}`)
);
