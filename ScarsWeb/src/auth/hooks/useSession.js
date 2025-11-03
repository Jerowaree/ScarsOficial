import { useEffect, useState } from "react";

export function useSession() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [name, setName] = useState(localStorage.getItem("userName"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const update = () => {
      setToken(localStorage.getItem("token"));
      setName(localStorage.getItem("userName"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("session-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("session-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return { token, name, role, isAuth: !!token };
}
