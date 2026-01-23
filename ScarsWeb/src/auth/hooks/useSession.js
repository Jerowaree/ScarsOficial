import { useEffect, useState } from "react";

export function useSession() {
  // El token ya no está en localStorage (httpOnly cookie)
  // Usamos sessionStorage solo para datos de UI (no críticos)
  const [name, setName] = useState(sessionStorage.getItem("userName"));
  const [role, setRole] = useState(sessionStorage.getItem("userRole"));

  useEffect(() => {
    const update = () => {
      setName(sessionStorage.getItem("userName"));
      setRole(sessionStorage.getItem("userRole"));
    };
    window.addEventListener("session-updated", update);
    return () => {
      window.removeEventListener("session-updated", update);
    };
  }, []);

  return { name, role, isAuth: !!name };
}
