// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
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

const app = express();
app.use(cors());
app.use(express.json());
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

app.listen(process.env.PORT || 4000, () =>
  console.log(`API on :${process.env.PORT || 4000}`)
);
  