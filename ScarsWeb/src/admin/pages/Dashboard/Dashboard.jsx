import { useMemo, useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Users, Car, Wrench, CheckCircle2,
  ArrowUpRight, RefreshCw, Plus, Calendar,
  TrendingUp, Activity, ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { listClientes } from "@/features/clientes/api";
import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const THIS_YEAR = new Date().getFullYear();

function safeMonthIndex(d) {
  if (!d) return null;
  const t = new Date(d);
  if (isNaN(+t) || t.getFullYear() !== THIS_YEAR) return null;
  return t.getMonth();
}
function series12() { return Array.from({ length: 12 }, () => 0); }

export default function Dashboard() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [serviciosConcluidos, setServiciosConcluidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = async () => {
    try {
      setRefreshing(true);
      const [clientesData, vehiculosRes, activosRes, concluidosRes] = await Promise.all([
        listClientes(),
        api.get(ENDPOINTS.vehiculos),
        api.get(ENDPOINTS.seguimiento),
        api.get('/servicios/concluidos').catch(() => ({ data: [] }))
      ]);

      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setVehiculos(Array.isArray(vehiculosRes.data) ? vehiculosRes.data : []);
      setServiciosActivos(Array.isArray(activosRes.data) ? activosRes.data : []);
      setServiciosConcluidos(Array.isArray(concluidosRes.data) ? concluidosRes.data : []);
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  /* === KPIs === */
  const kpiData = useMemo(() => [
    {
      label: "Clientes",
      value: clientes.length,
      icon: Users,
      color: "var(--scars-pink)",
      trend: "+12%",
      desc: "Registrados este año"
    },
    {
      label: "Vehículos",
      value: vehiculos.length,
      icon: Car,
      color: "var(--scars-pink)",
      trend: "+5%",
      desc: "En base de datos"
    },
    {
      label: "Servicios Activos",
      value: serviciosActivos.length,
      icon: Wrench,
      color: "var(--scars-pink)",
      trend: "En marcha",
      desc: "Trabajos actuales"
    },
    {
      label: "Completados",
      value: serviciosConcluidos.length,
      icon: CheckCircle2,
      color: "var(--emerald)",
      trend: "Total",
      desc: "Servicios finalizados"
    }
  ], [clientes, vehiculos, serviciosActivos, serviciosConcluidos]);

  /* === GRÁFICOS === */
  const growthData = useMemo(() => {
    const arr = series12();
    clientes.forEach(c => {
      const idx = safeMonthIndex(c.fecha_registro || c.createdAt);
      if (idx != null) arr[idx]++;
    });
    return MONTHS.map((mes, i) => ({ mes, valor: arr[i] }));
  }, [clientes]);

  const vehiclesByType = useMemo(() => {
    const auto = vehiculos.filter(v => String(v.tipo || "").toLowerCase().includes("autom")).length;
    const moto = vehiculos.filter(v => String(v.tipo || "").toLowerCase().includes("moto")).length;
    return [
      { subject: "Automóvil", A: auto, fullMark: Math.max(auto, moto) + 5 },
      { subject: "Moto", A: moto, fullMark: Math.max(auto, moto) + 5 },
      { subject: "Otros", A: 0, fullMark: Math.max(auto, moto) + 5 },
    ];
  }, [vehiculos]);

  const serviceTrend = useMemo(() => {
    const arr = series12();
    serviciosActivos.forEach(s => {
      const idx = safeMonthIndex(s.fecha);
      if (idx != null) arr[idx]++;
    });
    return MONTHS.map((mes, i) => ({ mes, valor: arr[i] }));
  }, [serviciosActivos]);

  const recentActivity = useMemo(() => {
    const recent = [...clientes]
      .sort((a, b) => new Date(b.fecha_registro || b.createdAt) - new Date(a.fecha_registro || a.createdAt))
      .slice(0, 5);
    return recent;
  }, [clientes]);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="loader"></div>
        <p>Cargando Dashboard Hero...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header Section */}
      <header className="dash-header">
        <div className="welcome-text">
          <h1>Resumen del Taller</h1>
          <p>Bienvenido de nuevo. Aquí tienes el pulso de Scars hoy.</p>
        </div>
        <div className="header-actions">
          <button className={`btn-refresh ${refreshing ? 'spinning' : ''}`} onClick={cargar}>
            <RefreshCw size={18} />
          </button>
          <div className="date-display" style={{ background: 'linear-gradient(135deg, var(--scars-pink), var(--scars-navy))', boxShadow: '0 4px 15px rgba(226, 28, 91, 0.3)' }}>
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="kpi-masonry">
        {kpiData.map((kpi, i) => (
          <div key={i} className="kpi-glass-card" style={{ "--item-color": kpi.color }}>
            <div className="kpi-icon-wrap">
              <kpi.icon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.label}</span>
              <h2 className="kpi-value">{kpi.value}</h2>
              <div className="kpi-footer">
                <span className="kpi-trend">
                  <TrendingUp size={14} /> {kpi.trend}
                </span>
                <span className="kpi-desc">{kpi.desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dash-main-grid">
        {/* Chart Area 1: Volume */}
        <div className="dash-card main-chart">
          <div className="card-head">
            <h3><Activity size={18} /> Tendencia de Servicios</h3>
            <span className="badge" style={{ background: 'rgba(226, 28, 91, 0.1)', color: 'var(--scars-pink)' }}>Anual</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={serviceTrend}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--scars-pink)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--scars-pink)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="valor" stroke="var(--scars-pink)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Static Side */}
        <aside className="dash-side-panel">
          <div className="dash-card quick-actions">
            <h3>Acciones Rápidas</h3>
            <div className="action-btns">
              <button onClick={() => navigate("/admin/dashboard/clientes")} className="action-item">
                <Plus size={20} />
                <span>Nuevo Cliente</span>
              </button>
              <button onClick={() => navigate("/admin/dashboard/vehiculos")} className="action-item">
                <Plus size={20} />
                <span>Registrar Vehículo</span>
              </button>
              <button onClick={() => navigate("/admin/dashboard/seguimiento")} className="action-item">
                <ClipboardList size={20} />
                <span>Nuevo Seguimiento</span>
              </button>
            </div>
          </div>

          <div className="dash-card radar-wrap">
            <h3>Distribución de Vehículos</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={vehiclesByType}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Radar name="Vehículos" dataKey="A" stroke="var(--scars-pink)" fill="var(--scars-pink)" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>

        {/* Recent Activity Section */}
        <div className="dash-card recent-list">
          <div className="card-head">
            <h3>Clientes Recientes</h3>
            <button className="text-btn" onClick={() => navigate("/admin/dashboard/clientes")} style={{ color: 'var(--scars-pink)' }}>Ver todos <ArrowUpRight size={14} /></button>
          </div>
          <div className="activity-items">
            {recentActivity.map((client, i) => (
              <div key={i} className="activity-row">
                <div className="client-avatar" style={{ color: 'var(--scars-pink)' }}>
                  {client.nombres?.[0]}{client.apellidos?.[0]}
                </div>
                <div className="activity-info">
                  <p className="client-name">{client.nombres} {client.apellidos}</p>
                  <p className="client-meta">{client.correo || "Sin correo"}</p>
                </div>
                <div className="activity-status">
                  <span className="status-badge">Nuevo</span>
                  <span className="time-ago">Ene 2026</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="empty-msg">No hay actividad reciente</p>}
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="dash-card bar-chart">
          <div className="card-head">
            <h3>Crecimiento de Clientes</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="valor" fill="var(--scars-pink)" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
