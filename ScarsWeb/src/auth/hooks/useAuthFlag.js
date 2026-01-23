import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Hook para verificar si el usuario está autenticado
 * Ahora verifica haciendo una petición al backend que valida la cookie httpOnly
 */
export function useAuthFlag() {
  const [isAuth, setIsAuth] = useState(null); // null = cargando, true/false = resultado


  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Hacer una petición simple al backend para verificar la cookie
        const res = await fetch(`${API_URL}/auth/verify`, {
          credentials: "include", // Enviar cookies
        });

        setIsAuth(res.ok);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();

    // Escuchar eventos de cambio de sesión
    const handleSessionUpdate = () => checkAuth();
    window.addEventListener("session-updated", handleSessionUpdate);

    return () => {
      window.removeEventListener("session-updated", handleSessionUpdate);
    };
  }, []);

  return isAuth; // Retorna null mientras carga, luego true/false
}
