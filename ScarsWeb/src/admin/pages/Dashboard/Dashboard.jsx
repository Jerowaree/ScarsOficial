import { useMemo, useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { Users, Car, Wrench, CheckCircle2 } from "lucide-react";
import "./Dashboard.css";
import { listClientes } from "@/features/clientes/api";
import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

/* === Helpers LS === */
function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
function readAny(keys, fallback) {
  for (const k of keys) {
    const v = readLS(k, null);
    if (v != null) return v;
  }
  return fallback;
}

/* === Tipos (parciales) === */

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const THIS_YEAR = new Date().getFullYear();

function safeMonthIndex(d) {
  if (!d) return null;
  const t = new Date(d);
  if (isNaN(+t) || t.getFullYear() !== THIS_YEAR) return null;
  return t.getMonth();
}
function series12() { return Array.from({ length: 12 }, () => 0); }
function sumMonth(arr, monthIndex) {
  const item = arr[monthIndex];
  return item ? item.valor : 0;
}

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [serviciosConcluidos, setServiciosConcluidos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        // Cargar clientes
        const clientesData = await listClientes();
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        
        // Cargar vehículos
        const vehiculosRes = await api.get(ENDPOINTS.vehiculos);
        setVehiculos(Array.isArray(vehiculosRes.data) ? vehiculosRes.data : []);
        
        // Cargar servicios activos
        const activosRes = await api.get(ENDPOINTS.seguimiento);
        setServiciosActivos(Array.isArray(activosRes.data) ? activosRes.data : []);
        
        // Cargar servicios concluidos
        try {
          const concluidosRes = await api.get('/servicios/concluidos');
          setServiciosConcluidos(Array.isArray(concluidosRes.data) ? concluidosRes.data : []);
        } catch {
          setServiciosConcluidos([]);
        }
        
        // Cargar solicitudes
        const solicitudesRes = await api.get(ENDPOINTS.solicitudes);
        setSolicitudes(Array.isArray(solicitudesRes.data) ? solicitudesRes.data : []);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  /* === KPIs === */
  const kpis = useMemo(() => {
    const totalClientes = clientes.length;
    const totalVehiculos = vehiculos.length;
    const totalActivos = serviciosActivos.length;
    const totalConcluidos = serviciosConcluidos.length;
    const totalSolicitudes = solicitudes.length;

    return {
      totalClientes,
      totalVehiculos,
      totalActivos,
      totalConcluidos,
      totalSolicitudes,
    };
  }, [clientes, vehiculos, serviciosActivos, serviciosConcluidos, solicitudes]);

  /* === GRÁFICOS === */
  const clientesPorMes = useMemo(() => {
    const arr = series12();
    clientes.forEach(c => {
      const fecha = c.fecha_registro || c.createdAt || c.fecha;
      const idx = safeMonthIndex(fecha);
      if (idx != null) arr[idx]++;
    });
    return MONTHS.map((mes, i) => ({ mes, valor: arr[i] }));
  }, [clientes]);

  const vehiculosPorTipo = useMemo(() => {
    const normalizeTipo = (t) => {
      const s = String(t || "").toLowerCase().replace(/[\-_]+/g, "");
      return s.includes("autom") ? "Automóvil" : s === "moto" ? "Moto" : null;
    };
    const auto = vehiculos.filter(v => normalizeTipo(v.tipo) === "Automóvil").length;
    const moto = vehiculos.filter(v => normalizeTipo(v.tipo) === "Moto").length;
    return [
      { name: "Automóvil", value: auto, color: "#3b82f6" },
      { name: "Moto", value: moto, color: "#10b981" },
    ];
  }, [vehiculos]);

  const serviciosPorMes = useMemo(() => {
    const arr = series12();
    serviciosActivos.forEach(s => {
      const idx = safeMonthIndex(s.fecha);
      if (idx != null) arr[idx]++;
    });
    return MONTHS.map((mes, i) => ({ mes, valor: arr[i] }));
  }, [serviciosActivos]);

  const solicitudesPorEstado = useMemo(() => {
    const estados = {};
    solicitudes.forEach(s => {
      const estado = s.estado || "Pendiente";
      estados[estado] = (estados[estado] || 0) + 1;
    });
    return Object.entries(estados).map(([name, value]) => ({ name, value }));
  }, [solicitudes]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard General</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#93c5fd" }}>
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard General</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <Users className="kpi-icon" />
          <div className="kpi-content">
            <p className="kpi-number">{kpis.totalClientes}</p>
            <p className="kpi-label">Clientes</p>
          </div>
        </div>
        <div className="kpi-card">
          <Car className="kpi-icon" />
          <div className="kpi-content">
            <p className="kpi-number">{kpis.totalVehiculos}</p>
            <p className="kpi-label">Vehículos</p>
          </div>
        </div>
        <div className="kpi-card">
          <Wrench className="kpi-icon" />
          <div className="kpi-content">
            <p className="kpi-number">{kpis.totalActivos}</p>
            <p className="kpi-label">Servicios Activos</p>
          </div>
        </div>
        <div className="kpi-card">
          <CheckCircle2 className="kpi-icon" />
          <div className="kpi-content">
            <p className="kpi-number">{kpis.totalConcluidos}</p>
            <p className="kpi-label">Servicios Concluidos</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Clientes por mes */}
        <div className="chart-card">
          <h3>Clientes Nuevos por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clientesPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehículos por tipo */}
        <div className="chart-card">
          <h3>Vehículos por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={vehiculosPorTipo}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {vehiculosPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Servicios por mes */}
        <div className="chart-card">
          <h3>Servicios Activos por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={serviciosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Solicitudes por estado */}
        <div className="chart-card">
          <h3>Solicitudes por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={solicitudesPorEstado}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#fbbf24" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
