# SCARS - Frontend

Frontend del sistema SCARS construido con React + Vite.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto (opcional):

```env
VITE_API_URL=http://localhost:4000/api
```

Si no se define, usará `http://localhost:4000/api` por defecto.

## 📝 Scripts

- `npm run dev` - Inicia el servidor de desarrollo (puerto 5173 por defecto)
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter

## 📂 Estructura

```
src/
├── admin/          # Panel administrativo
├── components/     # Componentes públicos
├── pages/          # Páginas públicas
├── api/            # Configuración de API
├── auth/           # Autenticación
└── styles/         # Estilos globales
```

Ver el README principal en la raíz del proyecto para más información.
