"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const clientes_routes_1 = __importDefault(require("./routes/clientes.routes"));
const vehiculos_routes_1 = __importDefault(require("./routes/vehiculos.routes"));
const serviciosCatalogo_routes_1 = __importDefault(require("./routes/serviciosCatalogo.routes"));
const serviciosActivos_routes_1 = __importDefault(require("./routes/serviciosActivos.routes"));
const serviciosConcluidos_routes_1 = __importDefault(require("./routes/serviciosConcluidos.routes"));
const solicitudes_routes_1 = __importDefault(require("./routes/solicitudes.routes"));
const auditoria_routes_1 = __importDefault(require("./routes/auditoria.routes"));
const empleados_routes_1 = __importDefault(require("./routes/empleados.routes"));
const seguimiento_routes_1 = __importDefault(require("./routes/seguimiento.routes"));
const chatbot_routes_1 = __importDefault(require("./routes/chatbot.routes"));
const almacen_routes_1 = __importDefault(require("./routes/almacen.routes"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const app = (0, express_1.default)();
// 1. Restricted CORS (Debe ir primero para manejar preflight OPTIONS)
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL || "https://scars.vercel.app",
        "https://www.scars.com.pe"
    ]
    : ["http://localhost:5173", "http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true
}));
// 2. Security Headers
app.use((0, helmet_1.default)());
// 3. Rate Limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
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
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // Middleware para parsear cookies
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.env.UPLOAD_DIR || "./uploads")));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/clientes", clientes_routes_1.default);
app.use("/api/vehiculos", vehiculos_routes_1.default);
app.use("/api/servicios/catalogo", serviciosCatalogo_routes_1.default);
app.use("/api/servicios/activos", serviciosActivos_routes_1.default);
app.use("/api/servicios/concluidos", serviciosConcluidos_routes_1.default);
app.use("/api/solicitudes", solicitudes_routes_1.default);
app.use("/api/auditoria", auditoria_routes_1.default);
app.use("/api/empleados", empleados_routes_1.default);
app.use("/api/seguimiento", seguimiento_routes_1.default);
app.use("/api/chatbot", chatbot_routes_1.default);
app.use("/api/almacen", almacen_routes_1.default);
app.listen(process.env.PORT || 4000, () => console.log(`API on :${process.env.PORT || 4000}`));
