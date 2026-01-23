import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

export async function listUsuarios() {
    const res = await api.get(ENDPOINTS.usuarios);
    return res.data;
}

export async function createUsuario(data) {
    const res = await api.post(ENDPOINTS.usuarios, data);
    return res.data;
}

export async function updateUsuario(id, data) {
    const res = await api.put(`${ENDPOINTS.usuarios}/${id}`, data);
    return res.data;
}

export async function deleteUsuario(id) {
    const res = await api.delete(`${ENDPOINTS.usuarios}/${id}`);
    return res.data;
}
