import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminLogin from "@/auth/pages/AdminLogin";
import Dashboard from "@/admin/pages/Dashboard/Dashboard";
import Clientes from "@/admin/pages/Clientes/Clientes";
import Vehiculos from "@/admin/pages/Vehiculos/Vehiculos";
import Empleados from "@/admin/pages/Empleados/Empleados";
import SolicitudesPage from "@/admin/pages/Solicitudes/Solicitudes";
import Seguimiento from "@/admin/pages/Seguimiento/Seguimiento";
import Servicios from "@/admin/pages/Servicios/Servicios";
import Perfil from "@/admin/pages/Perfil/Perfil";
import Sidebar from "@/admin/components/Sidebar/Sidebar";
import "./DashboardLayout.css";

function DashboardLayout() {
  return (
    <div className="admin-shell" data-admin-route>
      <Sidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Login */}
      <Route path="login" element={<AdminLogin />} />

      {/* Layout principal */}
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="vehiculos" element={<Vehiculos />} />
        <Route path="empleados" element={<Empleados />} />
        <Route path="solicitudes" element={<SolicitudesPage />} />
        <Route path="seguimiento" element={<Seguimiento />} />
        <Route path="servicios" element={<Servicios/>} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Redirección */}
      <Route path="*" element={<Navigate to="login" />} />
    </Routes>
  );
}
