import axios from "axios";
import { getToken, clearSession } from "@/auth/utils/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: false,
  timeout: 15000,
});

// ✅ Inserta el token automáticamente
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Si el token expira → limpia sesión
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
