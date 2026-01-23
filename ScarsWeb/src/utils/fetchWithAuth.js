/**
 * Helper para hacer fetch con cookies httpOnly automáticamente
 * Usar este helper en lugar de fetch() directamente
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function fetchWithAuth(url, options = {}) {
    const defaultOptions = {
        credentials: 'include', // Siempre enviar cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    // Si es 401, limpiar sesión y redirigir
    if (response.status === 401) {
        sessionStorage.clear();
        window.dispatchEvent(new Event("session-updated"));
        window.location.href = '/admin/login';
    }

    return response;
}

export { API_URL };
