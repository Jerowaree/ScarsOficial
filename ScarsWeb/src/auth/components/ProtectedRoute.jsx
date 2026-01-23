import { Navigate, useLocation } from "react-router-dom";
import { useAuthFlag } from "../hooks/useAuthFlag";

export default function ProtectedRoute({ children }) {
    const isAuth = useAuthFlag();
    const location = useLocation();

    // Si isAuth es null, aún está cargando - mostrar nada o un loader
    if (isAuth === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#E21C5B' }}>
            Verificando autenticación...
        </div>;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuth) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}
