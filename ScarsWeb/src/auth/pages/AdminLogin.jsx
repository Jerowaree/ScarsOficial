import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/images/LogoScarsOriginal.png";
import { saveSession } from "@/auth/utils/session";
import { login } from "@/features/auth/api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setToast({ message: "", type: "" });

      const data = await login({ correo: email, contrasena: password });
      const role = data.roles?.[0] || "admin";

      saveSession({
        access_token: data.access_token,
        role,
        name: data.name,
        email: data.correo,
      });

      // ✅ Toast verde con emoji y animación
      setToast({ message: "✅ Acceso validado", type: "success" });

      await new Promise((r) => setTimeout(r, 1200));
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("❌ Error login:", err);
      let msg = "⚠️ Error al iniciar sesión";

      if (err.response?.status === 401) {
        msg =
          err.response?.data?.error === "CREDENCIALES"
            ? "❌ Credenciales incorrectas"
            : "🚫 No autorizado";
      } else if (err.response?.data?.error) {
        msg = "⚠️ " + err.response.data.error;
      }

      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // 🔁 Auto ocultar toast
  useEffect(() => {
    if (toast.message) {
      const t = setTimeout(() => setToast({ message: "", type: "" }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="login-container" data-admin-route>
      {/* 🔔 Toast flotante */}
      {toast.message && (
        <div className={`toast premium ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <header className="login-header">
        <h2 className="login-subtitle">Portal de Administración</h2>
        <img src={logo} alt="Logo Scars" className="login-logo" />
      </header>

      {/* Caja */}
      <div className="login-box">
        <h1 className="login-title">Inicie Sesión</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field">
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              autoFocus
            />
          </div>

          <div className="password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setPasswordVisible(!passwordVisible)}
              aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {passwordVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 6.5c-3.54 0-6.74 2.07-8.24 5.5 1.5 3.43 4.7 5.5 8.24 5.5s6.74-2.07 8.24-5.5c-1.5-3.43-4.7-5.5-8.24-5.5Zm0 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
                  />
                  <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "🔄 Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
