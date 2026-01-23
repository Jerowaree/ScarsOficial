import axios from "axios";
import { clearSession } from "@/auth/utils/session";

/**
 * Cliente Axios configurado para usar cookies httpOnly
 * withCredentials: true permite enviar y recibir cookies automáticamente
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
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
