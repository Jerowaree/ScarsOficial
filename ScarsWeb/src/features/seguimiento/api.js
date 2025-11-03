// src/features/seguimiento/api.js
import publicApi from '../../api/publicAxios';

/**
 * Obtiene los datos de seguimiento por código
 * @param {string} codigo - Código de seguimiento
 * @returns {Promise<object>} Datos del seguimiento
 */
export async function getSeguimientoByCode(codigo) {
  try {
    const response = await publicApi.get(`/seguimiento/consulta/${codigo}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener seguimiento:", error);
    throw error;
  }
}

