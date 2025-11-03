// src/features/vehiculos/api.js
import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

// helpers de mapeo entre UI <-> DB
const toDBTipo = (t) => (t === "Automóvil" ? "Autom_vil" : "Moto");
const fromDBTipo = (t) => (t === "Autom_vil" ? "Automóvil" : "Moto");

/** 🔹 Listar vehículos (q opcional) */
export async function listVehiculos(q) {
  const res = await api.get(ENDPOINTS.vehiculos, { params: { q } });
  // Backend devuelve tipo como Autom_vil | Moto → mapear a "Automóvil" | "Moto"
  return res.data.map((v) => ({
    id_vehiculo: v.id_vehiculo,
    id_cliente: v.id_cliente,
    placa: v.placa,
    tipo: fromDBTipo(v.tipo),
    marca: v.marca ?? null,
    modelo: v.modelo ?? null,
    color: v.color ?? null,
    ano: v.anio ?? null, // Mapear anio -> ano para el frontend
    observaciones: v.observaciones ?? null,
  }));
}

/** 🔹 Crear vehículo (backend espera { codigoCliente, ... }) */
export async function createVehiculo(data) {
  const payload = {
    ...data,
    anio: data.ano === "" ? null : (data.ano != null ? Number(data.ano) : null), // Mapear ano -> anio para el backend
    tipo: toDBTipo(data.tipo),
  };
  const res = await api.post(ENDPOINTS.vehiculos, payload);
  const v = res.data;
  return {
    id_vehiculo: v.id_vehiculo,
    id_cliente: v.id_cliente,
    placa: v.placa,
    tipo: fromDBTipo(v.tipo),
    marca: v.marca ?? null,
    modelo: v.modelo ?? null,
    color: v.color ?? null,
    ano: v.anio ?? null, // Mapear anio -> ano para el frontend
    observaciones: v.observaciones ?? null,
  };
}

/** 🔹 Actualizar vehículo */
export async function updateVehiculo(id, data) {
  const send = { ...data };
  if (send.tipo) send.tipo = toDBTipo(send.tipo);
  if ("ano" in send) {
    send.anio = send.ano === "" ? null : (send.ano != null ? Number(send.ano) : null); // Mapear ano -> anio
    delete send.ano; // Eliminar el campo incorrecto
  }
  const res = await api.put(`${ENDPOINTS.vehiculos}/${id}`, send);
  const v = res.data;
  return {
    id_vehiculo: v.id_vehiculo,
    id_cliente: v.id_cliente,
    placa: v.placa,
    tipo: fromDBTipo(v.tipo),
    marca: v.marca ?? null,
    modelo: v.modelo ?? null,
    color: v.color ?? null,
    ano: v.anio ?? null, // Mapear anio -> ano para el frontend
    observaciones: v.observaciones ?? null,
  };
}

/** 🔹 Eliminar vehículo */
export async function deleteVehiculo(id) {
  await api.delete(`${ENDPOINTS.vehiculos}/${id}`);
}
