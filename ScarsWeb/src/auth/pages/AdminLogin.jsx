import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
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

      setToast({ message: "Acceso validado correctamente", type: "success" });

      await new Promise((r) => setTimeout(r, 1200));
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("❌ Error login:", err);
      let msg = "Error al iniciar sesión";

      if (err.response?.status === 401) {
        msg =
          err.response?.data?.error === "CREDENCIALES"
            ? "Credenciales incorrectas"
            : "No autorizado";
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
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
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}

      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-brand">
            <img src={logo} alt="SCARS - Taller Mecánico" className="login-logo" />
            <h1 className="login-brand-title">SCARS</h1>
            <p className="login-brand-subtitle">Portal de Administración</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <Lock size={32} className="login-icon" />
              <h2 className="login-title">Iniciar Sesión</h2>
              <p className="login-description">Ingresa tus credenciales para acceder al panel</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  <Mail size={18} />
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  <Lock size={18} />
                  Contraseña
                </label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
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
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Ingresando...
                  </span>
                ) : (
                  <span className="btn-content">
                    Ingresar
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
