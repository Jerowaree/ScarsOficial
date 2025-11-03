import axios from "axios";

const privateApi = axios.create({
  baseURL: "http://localhost:4000/api", // Asegúrate de que esta URL base sea correcta
});

/**
 * Interceptor para añadir el token de autenticación a las cabeceras
 * de cada petición privada.
 */
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin-token"); // O como se llame tu token en localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default privateApi;