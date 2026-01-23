import axios from "axios";
import { clearSession } from "@/auth/utils/session";

/**
 * Cliente Axios configurado para usar cookies httpOnly
 * withCredentials: true permite enviar y recibir cookies automáticamente
 */
const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return "http://localhost:4000/api";

  // Si no empieza con http, es probable que se haya configurado mal en Vercel
  // y el navegador lo trate como ruta relativa. Forzamos https.
  if (!url.startsWith("http") && !url.includes("localhost")) {
    return `https://${url}`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // ✅ Enviar cookies automáticamente
  timeout: 15000,
});

// ✅ Si el token expira (401) → limpia sesión local
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearSession();
      window.dispatchEvent(new CustomEvent("session-updated"));
    }
    return Promise.reject(err);
  }
);

export default api;
