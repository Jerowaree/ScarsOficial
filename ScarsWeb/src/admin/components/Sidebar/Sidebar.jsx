import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  UserCog,
  ClipboardList,
  Wrench,
  Settings2,
  Cog,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/images/LogoScarsrosa.png";
import "./Sidebar.css";
import { clearSession } from "@/auth/utils/session";


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearSession(); // 
    navigate("/admin/login", { replace: true }); 
  };

  // 🔒 Cierra menús al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setSidebarOpen(false);
  }, [location]);

  return (
    <>
      {/* Botón hamburguesa - SOLO móvil */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo y título */}
        <div className="sidebar-header">
          <img src={logo} alt="Logo SCARS" className="sidebar-logo" />
          <h2 className="sidebar-title">Portal de Administración</h2>
        </div>

        {/* Fondo animado restaurado */}
        <div className="sidebar-bg">
          {[...Array(4)].map((_, i) => (
            <Wrench key={`w${i}`} className="bg-tool" />
          ))}
          {[...Array(4)].map((_, i) => (
            <Cog key={`c${i}`} className="bg-gear" />
          ))}
        </div>

        {/* Navegación */}
        <nav>
          <ul>
            <li>
              <Link to="/admin/dashboard">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/clientes">
                <Users size={18} /> Clientes
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/vehiculos">
                <Car size={18} /> Vehículos
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/empleados">
                <UserCog size={18} /> Empleados
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/solicitudes">
                <ClipboardList size={18} /> Solicitudes
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/seguimiento">
                <Wrench size={18} /> Seguimiento
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/servicios">
                <Settings2 size={18} /> Servicios
              </Link>
            </li>
          </ul>
        </nav>

        {/* Perfil (restaurado) */}
        <div className="sidebar-profile">
          <button
            className="profile-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <UserCircle size={40} />
          </button>

          {menuOpen && (
            <div className="profile-menu">
              <button onClick={() => navigate("/admin/dashboard/perfil")}>
                <UserCog size={16} /> Mi cuenta
              </button>
              <button onClick={handleLogout}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
