# SCARS - Sistema de Gestión de Taller Automotriz

Sistema completo de gestión para taller automotriz con panel administrativo y portal público.

## 📋 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.0
- **Git**

##  Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd ScarsVersion
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../ScarsWeb
npm install
```

## ⚙️ Configuración

### Backend - Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Base de datos
DATABASE_URL="mysql://usuario:password@localhost:3306/scars_db"

# JWT
JWT_SECRET="tu-secret-key-muy-segura-aqui"

# Servidor
PORT=4000

# OpenAI (Opcional - para chatbot)
OPENAI_API_KEY=sk-tu-api-key-aqui
OPENAI_MODEL=gpt-4o-mini

# Uploads
UPLOAD_DIR=./uploads
```

### Frontend - Variables de Entorno

Crear archivo `.env` en la carpeta `ScarsWeb/` (opcional):

```env
VITE_API_URL=http://localhost:4000/api
```

Si no se define, usará `http://localhost:4000/api` por defecto.

## 🗄️ Base de Datos y Migraciones

### 1. Configurar la base de datos MySQL

Crear la base de datos:

```sql
CREATE DATABASE scars_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Ejecutar migraciones de Prisma

Desde la carpeta `backend/`:

```bash
# Generar el cliente de Prisma
npx prisma generate

# Aplicar todas las migraciones
npx prisma migrate deploy

# O si estás en desarrollo, puedes usar:
npx prisma migrate dev
```

### 3. (Opcional) Poblar la base de datos con datos de ejemplo

```bash
npm run seed
```

##  Schema de Prisma

El schema de la base de datos está definido en `backend/prisma/schema.prisma`.

### Principales modelos:

- **usuarios** - Usuarios del sistema
- **roles** y **permisos** - Sistema de autorización
- **clientes** - Clientes del taller
- **vehiculos** - Vehículos de los clientes
- **servicios_activos** - Servicios en curso
- **servicios_concluidos** - Servicios finalizados
- **servicios_catalogo** - Catálogo de servicios disponibles
- **empleados** - Empleados del taller
- **solicitudes** - Solicitudes de contacto
- **auditoria** - Registro de auditoría

### Ver el schema completo:

```bash
cd backend
cat prisma/schema.prisma
```

### Generar cliente de Prisma después de cambios:

```bash
npx prisma generate
```

### Crear nueva migración:

```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

### Ver el estado de las migraciones:

```bash
npx prisma migrate status
```

##  Ejecutar el Proyecto

### Backend

Desde la carpeta `backend/`:

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción (después de build)
npm run build
npm start
```

El backend estará disponible en: `http://localhost:4000`

### Frontend

Desde la carpeta `ScarsWeb/`:

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

El frontend estará disponible en: `http://localhost:5173` (o el puerto que Vite asigne)

##  Scripts Disponibles

### Backend

- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en modo producción
- `npm run seed` - Pobla la base de datos con datos de ejemplo

### Frontend

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter

## 🗂️ Estructura del Proyecto

```
ScarsVersion/
├── backend/                 # API Backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/     # Middlewares (auth, permisos)
│   │   ├── db/             # Configuración de Prisma
│   │   └── utils/          # Utilidades
│   ├── prisma/
│   │   ├── schema.prisma   # Schema de la base de datos
│   │   └── migrations/     # Migraciones
│   └── uploads/            # Archivos subidos
│
└── ScarsWeb/               # Frontend (React + Vite)
    ├── src/
    │   ├── admin/          # Panel administrativo
    │   ├── components/     # Componentes públicos
    │   ├── pages/          # Páginas públicas
    │   ├── api/            # Configuración de API
    │   └── auth/           # Autenticación
    └── public/             # Archivos estáticos
```

##  Características Principales

- ✅ Sistema de autenticación con JWT
- ✅ Panel administrativo completo
- ✅ Gestión de clientes y vehículos
- ✅ Seguimiento de servicios activos y concluidos
- ✅ Catálogo de servicios
- ✅ Sistema de permisos y roles
- ✅ Auditoría de acciones
- ✅ Chatbot con OpenAI (opcional)
- ✅ Portal público con seguimiento de servicios

##  Solución de Problemas

### Error de conexión a la base de datos

Verifica que:
- MySQL esté corriendo
- Las credenciales en `.env` sean correctas
- La base de datos exista

### Error al ejecutar migraciones

```bash
# Resetear migraciones (CUIDADO: borra datos)
npx prisma migrate reset

# O aplicar migraciones pendientes
npx prisma migrate deploy
```

### Puerto ya en uso

Cambia el puerto en el archivo `.env` del backend o en `vite.config.js` del frontend.

## Tecnologías Utilizadas

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL
- JWT
- OpenAI API

### Frontend
- React 19
- Vite
- React Router
- Axios
- Recharts
- Lucide React

## 📄 Licencia

ISC

