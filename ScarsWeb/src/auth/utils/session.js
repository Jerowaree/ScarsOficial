/**
 * Utilidades de sesión - Migrado a httpOnly cookies
 * Ya no usamos localStorage para el token (seguridad XSS)
 * El token ahora está en una cookie httpOnly manejada por el backend
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/**
 * Guardar información de sesión (solo datos del usuario, NO el token)
 * El token está en cookie httpOnly y no es accesible desde JavaScript
 */
export function saveSession(data) {
  // Solo guardamos info del usuario en sessionStorage (no sensible)
  if (data.name) {
    sessionStorage.setItem("userName", data.name);
  }
  if (data.email) {
    sessionStorage.setItem("userEmail", data.email);
  }
  if (data.role) {
    sessionStorage.setItem("userRole", data.role);
  }

  // Emitir evento para que otros componentes se enteren
  window.dispatchEvent(new Event("session-updated"));
}

/**
 * Limpiar sesión (llamar al logout del backend para limpiar cookie)
 */
export async function clearSession() {
  try {
    // Llamar al endpoint de logout para limpiar la cookie httpOnly
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }

  // Limpiar datos locales
  sessionStorage.clear();
  window.dispatchEvent(new Event("session-updated"));
}

/**
 * Obtener información del usuario (solo datos no sensibles)
 */
export function getUserInfo() {
  return {
    name: sessionStorage.getItem("userName"),
    email: sessionStorage.getItem("userEmail"),
    role: sessionStorage.getItem("userRole")
  };
}
