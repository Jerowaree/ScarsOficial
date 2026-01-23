import { Navigate, useLocation } from "react-router-dom";
import { useAuthFlag } from "../hooks/useAuthFlag";

export default function ProtectedRoute({ children }) {
    const isAuth = useAuthFlag();
    const location = useLocation();

    if (!isAuth) {
        // Redirigir al login si no hay token, guardando la ubicación actual para volver después si fuese necesario
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
}
