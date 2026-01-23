// src/features/vehiculos/api.js
import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

// helpers de mapeo entre UI <-> DB
const toDBTipo = (t) => (t === "Automóvil" ? "Automovil" : "Moto");
const fromDBTipo = (t) => (t === "Automovil" ? "Automóvil" : "Moto");

/** 🔹 Listar vehículos (q opcional) */
export async function listVehiculos(q) {
  const res = await api.get(ENDPOINTS.vehiculos, { params: { q } });
  // Backend devuelve tipo como Automovil | Moto → mapear a "Automóvil" | "Moto"
  return res.data.map((v) => ({
    id_vehiculo: v.id_vehiculo,
    id_cliente: v.id_cliente,
    placa: v.placa,
    tipo: fromDBTipo(v.tipo),
    marca: v.marca ?? null,
    modelo: v.modelo ?? null,
    color: v.color ?? null,
    anio: v.anio ?? null,
    observaciones: v.observaciones ?? null,
  }));
}

/** 🔹 Crear vehículo (backend espera { codigoCliente, ... }) */
export async function createVehiculo(data) {
  const payload = {
    ...data,
    anio: data.anio === "" ? null : (data.anio != null ? Number(data.anio) : null),
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
    anio: v.anio ?? null,
    observaciones: v.observaciones ?? null,
  };
}

/** 🔹 Actualizar vehículo */
export async function updateVehiculo(id, data) {
  const send = { ...data };
  if (send.tipo) send.tipo = toDBTipo(send.tipo);
  if ("anio" in send) {
    send.anio = send.anio === "" ? null : (send.anio != null ? Number(send.anio) : null);
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
    anio: v.anio ?? null,
    observaciones: v.observaciones ?? null,
  };
}

/** 🔹 Eliminar vehículo */
export async function deleteVehiculo(id) {
  await api.delete(`${ENDPOINTS.vehiculos}/${id}`);
}
