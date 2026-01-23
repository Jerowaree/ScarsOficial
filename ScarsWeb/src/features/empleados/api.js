// src/features/empleados/api.js
import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";


const fromDBHorario = (h) => {
  if (h === "Ma_ana") return "Mañana";
  if (h === "Ma_ana_y_Tarde") return "Mañana y Tarde";
  if (h === "Tarde") return "Tarde";
  return null;
};

// 🔹 Listar
export async function listEmpleados(q) {
  const res = await api.get(ENDPOINTS.empleados, { params: { q } });
  return res.data.map((e) => ({
    ...e,
    sueldo: e.sueldo ?? null,
    horario: fromDBHorario(e.horario),
  }));
}

// 🔹 Crear
export async function createEmpleado(data) {
  const payload = { ...data };
  // payload.horario se envía tal cual ("Mañana", etc.) para que pase validación Zod
  if ("sueldo" in payload) {
    payload.sueldo = payload.sueldo === "" ? null : payload.sueldo;
  }
  const res = await api.post(ENDPOINTS.empleados, payload);
  const e = res.data;
  return { ...e, horario: fromDBHorario(e.horario) };
}

// 🔹 Actualizar
export async function updateEmpleado(id, data) {
  const payload = { ...data };
  // payload.horario se envía tal cual
  if ("sueldo" in payload) {
    payload.sueldo = payload.sueldo === "" ? null : payload.sueldo;
  }
  const res = await api.put(`${ENDPOINTS.empleados}/${id}`, payload);
  const e = res.data;
  return { ...e, horario: fromDBHorario(e.horario) };
}

// 🔹 Eliminar
export async function deleteEmpleado(id) {
  await api.delete(`${ENDPOINTS.empleados}/${id}`);
}
