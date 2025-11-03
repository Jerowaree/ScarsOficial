// src/features/contacto/api.js
import publicApi from '../../api/publicAxios';
import { ENDPOINTS } from '../../api/endpoints';

/**
 * Envía los datos del formulario de contacto al backend.
 * Mapea los campos del formulario a los campos del schema de solicitudes.
 * @param {object} data - Los datos del formulario.
 * @param {string} data.nombre - Nombre o empresa del remitente.
 * @param {string} data.modelo - Modelo del vehículo.
 * @param {string} data.anio - Año del vehículo.
 * @param {string} data.correo - Correo del remitente.
 * @param {string} data.telefono - Teléfono de contacto del remitente.
 * @param {string} data.mensaje - Mensaje del remitente.
 * @param {string} data.tipo - Tipo de solicitud (opcional).
 */
export const enviarSolicitudContacto = async (data) => {
  try {
    // Mapear campos del formulario a los campos del schema de solicitudes
    const payload = {
      nombre: data.nombre || "",
      correo: data.correo || "",
      modelo: data.modelo || null,
      anio: data.anio ? parseInt(data.anio, 10) : null,
      numero: data.telefono || "", // telefono -> numero en el schema
      mensaje: data.mensaje || null, // se puede usar mensaje o detalle
      detalle: data.mensaje || null, // guardar también en detalle para compatibilidad
      tipo: data.tipo || null, // campo adicional si existe
    };
    // Usar el endpoint /crear del backend
    const response = await publicApi.post(`${ENDPOINTS.solicitudes}/crear`, payload);
    return response.data;
  } catch (error) {
    console.error("Error al enviar la solicitud de contacto:", error);
    throw error; // Propagamos el error para que el componente que llama pueda manejarlo.
  }
};