import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

export async function login(payload) {
  const res = await api.post(ENDPOINTS.auth.login, payload);
  return res.data;
}
