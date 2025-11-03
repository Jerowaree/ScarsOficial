import privateApi from "../../api/privateAxios";
import { ENDPOINTS } from "../../../api/endpoints";

/**
 * Obtiene la lista de todas las solicitudes desde el backend.
 * Esta función utiliza la API privada, por lo que requiere autenticación.
 * @returns {Promise<Array>} Una promesa que resuelve a un array de solicitudes.
 */
export const getSolicitudesAdmin = async () => {
  try {
    const response = await privateApi.get(ENDPOINTS.solicitudes);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las solicitudes para el admin:", error);
    throw error;
  }
};