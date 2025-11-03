import { useEffect, useState } from "react";

export function useAuthFlag() {
  const [hasToken, setHasToken] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const update = () => setHasToken(!!localStorage.getItem("token"));
    window.addEventListener("session-updated", update);
    window.addEventListener("storage", update); // para otros tabs
    return () => {
      window.removeEventListener("session-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return hasToken;
}
