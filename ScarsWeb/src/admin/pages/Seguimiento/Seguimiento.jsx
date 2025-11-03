import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Filter, Plus, Trash2, X, Clock, Edit, ArrowUpDown, Search } from "lucide-react";
import "./Seguimiento.css";
import { listClientes } from "@/features/clientes/api";

/* === CONFIG === */
const PROCESOS = [
  "Recepción del vehículo",
  "Diagnóstico técnico", 
  "Evaluación y presupuesto",
  "Aprobación del cliente",
  "En espera de suministro",
  "Ejecución del servicio",
  "Control de calidad",
  "Entrega del vehículo",
  "Cierre del servicio",
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* === STORE (API) === */

/* === UTILS === */
function generarCodigoSimple(existing) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  do {
    code = Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (existing.has(code));
  return code;
}

const fmtDMY = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

const stripDiacritics = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizeProceso = (value) => {
  const target = stripDiacritics(String(value).replace(/[\-_]+/g, " ").trim());
  for (const p of PROCESOS) {
    if (stripDiacritics(p) === target) return p;
  }
  return PROCESOS[0];
};

const normalizeEstado = (value) => {
  const raw = String(value || "").replace(/[\-_]+/g, " ").trim();
  const s = raw.toLowerCase();
  if (s === "en curso") return "En curso";
  if (s === "finalizado") return "Finalizado";
  if (s === "cancelado") return "Cancelado";
  return raw || "En curso";
};

const normalizeTipo = (value) => {
  const v = String(value || "");
  if (v === "Autom_vil" || /autom[\-_]?vil/i.test(v)) return "Automóvil";
  return v === "Moto" ? "Moto" : v;
};

const highlight = (text, q) => {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
};

export default function Seguimiento() {
  const [vista, setVista] = useState("activos");
  const [ordenDesc, setOrdenDesc] = useState(true);
  
  // Data stores
  const [clientesStore, setClientesStore] = useState([]);
  const [serviciosStore, setServiciosStore] = useState([]); // activos desde backend
  
  // Tablas
  const [activos, setActivos] = useState([]);
  const [concluidos, setConcluidos] = useState([]);
  
  const [busqueda, setBusqueda] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Columnas opcionales
  const [colsActivos, setColsActivos] = useState(["tipo", "servicios", "proceso", "fecha", "detalles"]);
  const [colsConcluidos, setColsConcluidos] = useState(["placa", "tipo", "fecha", "servicios", "observaciones"]);
  
  // Modal states
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditarActivo, setShowModalEditarActivo] = useState(null);
  const [modalAviso, setModalAviso] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Picker Cliente
  const [clienteQuery, setClienteQuery] = useState("");
  const [selectedCliente, setSelectedCliente] = useState(null);
  
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1600);
  };

  // Form state
  const [nuevo, setNuevo] = useState({
    codigoCliente: "",
    placa: "",
    tipo: "Automóvil",
    seguimiento: "",
    dueno: "",
    servicios: [], // guardará IDs de servicios de catálogo
    proceso: PROCESOS[0],
    fecha: "",
    detalles: "",
    estado: "En curso",
  });

  const loadActivos = useCallback(async () => {
    try {
      // Cargar clientes
      try {
        const clientes = await listClientes();
        setClientesStore(Array.isArray(clientes) ? clientes : []);
      } catch {
        setClientesStore([]);
      }
      // Cargar servicios catálogo activos
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/servicios/catalogo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json().catch(() => []);
        const activos = Array.isArray(data) ? data.filter(s => (s.estado || '').toLowerCase() === 'activo') : [];
        setServiciosStore(activos);
      } catch {
        setServiciosStore([]);
      }
      // Cargar servicios activos (para acciones con ID)
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/servicios/activos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rows = await res.json().catch(() => []);
        const mapped = Array.isArray(rows) ? rows.map((r) => ({
          id: r.id_servicio_activo,
          placa: r.placa,
          seguimiento: r.numero_seguimiento,
          dueno: r.cliente_nombre,
          tipo: normalizeTipo(r.tipo),
          servicios: [], // no viene en el GET; se podría cargar detalle aparte
          proceso: normalizeProceso(r.proceso || PROCESOS[0]),
          fecha: r.fecha?.slice(0,10) || "",
          detalles: r.observaciones || "",
          estado: normalizeEstado(r.estado || "En curso"),
          codigoCliente: "",
        })) : [];
        setActivos(mapped);
        // Cargar detalle de servicios por cada activo
        const detalles = await Promise.all(mapped.map(async (row) => {
          try {
            const detRes = await fetch(`${API_URL}/servicios/activos/${row.id}/detalle`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const det = await detRes.json().catch(() => []);
            const ids = Array.isArray(det) ? det.map(d => d.id_servicio) : [];
            return { id: row.id, ids };
          } catch {
            return { id: row.id, ids: [] };
          }
        }));
        setActivos(prev => prev.map(r => {
          const d = detalles.find(x => x.id === r.id);
          return d ? { ...r, servicios: d.ids } : r;
        }));
      } catch {}
    } catch {}
  }, []);

  const loadConcluidos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/servicios/concluidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rows = await res.json().catch(() => []);
      const mapped = Array.isArray(rows) ? rows.map((r) => {
        let servicios = [];
        try {
          const arr = JSON.parse(r.servicios_json || '[]');
          if (Array.isArray(arr)) servicios = arr.map((nombre) => ({ nombre }));
        } catch {
          servicios = [];
        }
        return {
          id: r.id_concluido,
          placa: r.placa,
          dueno: r.cliente_nombre,
          tipo: normalizeTipo(r.tipo),
          fecha: r.fecha?.slice(0,10) || "",
          servicios,
          observaciones: r.observaciones || "",
        };
      }) : [];
      setConcluidos(mapped);
    } catch {
      setConcluidos([]);
    }
  }, []);

  /* Cargar data */
  useEffect(() => {
    loadActivos();
    loadConcluidos();
  }, [loadActivos, loadConcluidos]);

  const serviciosById = useMemo(() => {
    const map = new Map();
    serviciosStore.forEach((s) => map.set(s.id_servicio, s));
    return map;
  }, [serviciosStore]);

  const codigosExistentes = useMemo(() => {
    const s = new Set();
    activos.forEach((a) => s.add(a.seguimiento));
    return s;
  }, [activos]);

  const clientesFiltrados = useMemo(() => {
    const q = clienteQuery.toLowerCase().trim();
    return clientesStore.filter((c) =>
      [c.codigo, c.nombres, c.apellidos, c.correo, c.telefono]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [clienteQuery, clientesStore]);

  // Vehículo del cliente (API retorna uno opcional en c.vehiculo)
  const vehiculoSeleccionado = useMemo(() => {
    if (!selectedCliente) return null;
    return selectedCliente.vehiculo || null;
  }, [selectedCliente]);

  const activosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return [...activos]
      .filter(
        (s) =>
          s.placa.toLowerCase().includes(q) ||
          s.seguimiento.toLowerCase().includes(q) ||
          s.dueno.toLowerCase().includes(q) ||
          s.tipo.toLowerCase().includes(q) ||
          s.servicios.some((id) => String(serviciosById.get(id)?.nombre || id).toLowerCase().includes(q)) ||
          s.proceso.toLowerCase().includes(q) ||
          s.detalles.toLowerCase().includes(q) ||
          s.fecha.toLowerCase().includes(q) ||
          s.codigoCliente.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        ordenDesc
          ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          : new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
  }, [activos, busqueda, ordenDesc]);
  
  const concluidosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return [...concluidos]
      .filter(
        (s) =>
          s.placa.toLowerCase().includes(q) ||
          s.dueno.toLowerCase().includes(q) ||
          s.tipo.toLowerCase().includes(q) ||
          s.servicios.some((srv) => String(srv.nombre || '').toLowerCase().includes(q)) ||
          s.observaciones.toLowerCase().includes(q) ||
          s.fecha.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        ordenDesc ? new Date(b.fecha).getTime() - new Date(a.fecha).getTime() : new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      );
  }, [concluidos, busqueda, ordenDesc]);

  // Funciones principales
  const generarSeguimiento = () => {
    setNuevo((prev) => ({ ...prev, seguimiento: generarCodigoSimple(codigosExistentes) }));
  };

  const onPickCliente = (c) => {
    setSelectedCliente(c);
    const v = c?.vehiculo || null;
    setNuevo((prev) => ({
      ...prev,
      codigoCliente: c.codigo || "",
      dueno: `${c.nombres || ''} ${c.apellidos || ''}`.trim(),
      placa: v?.placa ?? "",
      tipo: normalizeTipo(v?.tipo ?? "Automóvil"),
    }));
  };

  const limpiarCliente = () => {
    setSelectedCliente(null);
    setClienteQuery("");
    setNuevo((prev) => ({ ...prev, codigoCliente: "", dueno: "", placa: "", tipo: "Automóvil" }));
  };

  const guardarNuevo = async () => {
    if (!selectedCliente || !nuevo.codigoCliente || !nuevo.dueno || !nuevo.placa || !nuevo.fecha || nuevo.servicios.length === 0) {
      setModalAviso("Completa Cliente, Placa, Fecha y al menos 1 Servicio.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const payload = {
        codigoCliente: String(nuevo.codigoCliente || ""),
        placa: nuevo.placa,
        tipo: nuevo.tipo, // Incluir el tipo seleccionado
        fecha: nuevo.fecha, // Backend convierte a Date ISO
        serviciosIds: nuevo.servicios,
        observaciones: nuevo.detalles || "",
      };
      console.log("[Seguimiento] POST payload", payload);
      const res = await fetch(`${API_URL}/servicios/activos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const err = await res.json();
            message = err?.error || err?.message || message;
          } else {
            const text = await res.text();
            message = text || message;
          }
        } catch {}
        console.error("[Seguimiento] POST error", message);
        throw new Error(message);
      }
      const created = await res.json();
      console.log("[Seguimiento] POST created", created);
      setActivos((prev) => [
        ...prev,
        {
          id: created.id_servicio_activo,
          placa: created.placa || nuevo.placa,
          seguimiento: created.numero_seguimiento || nuevo.seguimiento,
          dueno: nuevo.dueno,
          tipo: created.tipo || nuevo.tipo,
          servicios: [...nuevo.servicios],
          proceso: created.proceso || PROCESOS[0],
          fecha: created.fecha || nuevo.fecha,
          detalles: nuevo.detalles,
          estado: created.estado || "En curso",
          codigoCliente: nuevo.codigoCliente,
        },
      ]);
      setNuevo({
        codigoCliente: "",
        placa: "",
        tipo: "Automóvil",
        seguimiento: "",
        dueno: "",
        servicios: [],
        proceso: PROCESOS[0],
        fecha: "",
        detalles: "",
        estado: "En curso",
      });
      setSelectedCliente(null);
      setClienteQuery("");
      setShowModalNuevo(false);
      showToast("Guardado con éxito");
    } catch (e) {
      setModalAviso(String(e.message || e));
    }
  };

  return (
    <section className="seguimiento-container">
      {/* Toast */}
      {toastMsg && (
        <div className="toast-success">
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="seguimiento-header">
        <div className="tabs">
          <button type="button" className={vista === "activos" ? "active" : ""} onClick={() => setVista("activos")}>
            Servicios Activos
          </button>
          <button type="button" className={vista === "concluidos" ? "active" : ""} onClick={() => setVista("concluidos")}>
            Servicios Concluidos
          </button>
        </div>

        <div className="actions">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
          />
          <button type="button" className="btn-filter" onClick={() => setShowFilters(true)}>
            <Filter size={18} /> Filtros
          </button>
          {vista === "activos" && (
            <button type="button" className="btn-add" onClick={() => setShowModalNuevo(true)}>
              <Plus size={18} /> Nuevo
            </button>
          )}
        </div>
      </div>

      {/* TABLA ACTIVOS */}
      {vista === "activos" && (
        <div className="table-wrapper">
          <table className="seguimiento-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>N° Seguimiento</th>
                <th>Cliente</th>
                {colsActivos.includes("tipo") && <th>Tipo</th>}
                {colsActivos.includes("servicios") && <th>Servicios</th>}
                {colsActivos.includes("proceso") && <th>Proceso</th>}
                {colsActivos.includes("fecha") && <th>Fecha</th>}
                {colsActivos.includes("detalles") && <th>Observaciones</th>}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay servicios activos
                  </td>
                </tr>
              ) : (
                activosFiltrados.map((s) => (
                  <tr key={s.seguimiento}>
                    <td>{s.placa}</td>
                    <td><span className="seg-chip">{s.seguimiento}</span></td>
                    <td>{s.dueno || "—"}</td>
                    {colsActivos.includes("tipo") && <td>{normalizeTipo(s.tipo)}</td>}
                    {colsActivos.includes("servicios") && (
                      <td>
                        <ul>
                          {s.servicios.length === 0 && <li>—</li>}
                          {s.servicios.map((id, i) => {
                            const it = serviciosById.get(id);
                            return <li key={i}>{it?.nombre || id}</li>;
                          })}
                        </ul>
                      </td>
                    )}
                    {colsActivos.includes("proceso") && <td>{s.proceso}</td>}
                    {colsActivos.includes("fecha") && <td>{fmtDMY(s.fecha)}</td>}
                    {colsActivos.includes("detalles") && <td>{s.detalles}</td>}
                    <td>{normalizeEstado(s.estado)}</td>
                    <td className="actions-cell">
                      <div className="cell-inline">
                        <select
                          className="select-proceso"
                          value={s.proceso}
                          onChange={(e) => setActivos(prev => prev.map(x => x.seguimiento === s.seguimiento ? { ...x, proceso: e.target.value } : x))}
                        >
                          {PROCESOS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button
                          className="inline-edit"
                        onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const row = activos.find(x => x.seguimiento === s.seguimiento) || s;
                              if (!row?.id) throw new Error('ID no disponible');
                              // Optimistic update
                              const prevSnapshot = activos;
                              const nuevoProceso = normalizeProceso(row.proceso);
                              const nuevoEstado = nuevoProceso === 'Cierre del servicio' ? 'Finalizado' : 'En curso';
                              setActivos(prev => prev.map(x => x.id === row.id ? { ...x, proceso: nuevoProceso, estado: nuevoEstado } : x));
                              const res = await fetch(`${API_URL}/servicios/activos/${row.id}/proceso`, {
                                method: 'PATCH',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json; charset=utf-8'
                                },
                                body: JSON.stringify({ proceso: normalizeProceso(row.proceso), observaciones: row.detalles })
                              });
                              if (!res.ok) {
                                let msg = `Error ${res.status}`;
                                try { const j = await res.json(); msg = j?.error || j?.message || msg; } catch {}
                                // rollback
                                setActivos(prevSnapshot);
                                throw new Error(msg);
                              }
                              showToast('Proceso actualizado');
                              // Refrescar en segundo plano para consolidar datos desde backend
                              loadActivos();
                              loadConcluidos();
                            } catch (e) {
                              setModalAviso(String(e.message || e));
                            }
                          }}
                        >Guardar</button>
                      </div>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const row = activos.find(x => x.seguimiento === s.seguimiento) || s;
                            if (!row?.id) throw new Error('ID no disponible');
                            const res = await fetch(`${API_URL}/servicios/activos/${row.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.status !== 204) {
                              let msg = `Error ${res.status}`;
                              try { const j = await res.json(); msg = j?.error || j?.message || msg; } catch {}
                              throw new Error(msg);
                            }
                            setActivos(prev => prev.filter(x => x.seguimiento !== s.seguimiento));
                            showToast('Eliminado');
                            // Refrescar
                            loadActivos();
                          } catch (e) {
                            setModalAviso(String(e.message || e));
                          }
                        }}
                      >Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TABLA CONCLUIDOS */}
      {vista === "concluidos" && (
        <div className="table-wrapper">
          <table className="seguimiento-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Cliente</th>
                {colsConcluidos.includes("tipo") && <th>Tipo</th>}
                {colsConcluidos.includes("fecha") && <th>Fecha Finalización</th>}
                {colsConcluidos.includes("servicios") && <th>Servicios Realizados</th>}
                {colsConcluidos.includes("observaciones") && <th>Observaciones</th>}
              </tr>
            </thead>
            <tbody>
              {concluidosFiltrados.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay servicios concluidos</td></tr>
              ) : (
                concluidosFiltrados.map((s) => (
                  <tr key={s.id}>
                    <td>{s.placa}</td>
                    <td>{s.dueno || "—"}</td>
                    {colsConcluidos.includes("tipo") && <td>{normalizeTipo(s.tipo)}</td>}
                    {colsConcluidos.includes("fecha") && <td>{fmtDMY(s.fecha)}</td>}
                    {colsConcluidos.includes("servicios") && <td>
                      <ul>{s.servicios.map((srv, i) => <li key={i}>{srv.nombre}</li>)}</ul>
                    </td>}
                    {colsConcluidos.includes("observaciones") && <td>{s.observaciones}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* MODAL NUEVO */}
      {showModalNuevo && (
        <div className="overlay" onClick={() => setShowModalNuevo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Servicio</h3>
              <button onClick={() => setShowModalNuevo(false)}><X /></button>
            </div>
            
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Cliente *</label>
                  {!selectedCliente ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Buscar por nombre, correo o código..."
                        value={clienteQuery}
                        onChange={(e) => setClienteQuery(e.target.value)}
                      />
                      <div className="client-list">
                        {clientesFiltrados.map((c) => (
                          <button key={c.codigo} onClick={() => onPickCliente(c)}>
                            <span className="client-name">{c.nombres} {c.apellidos}</span>
                            <span className="client-meta">{c.correo || ""} · Código: {c.codigo}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="selected-client">
                      <span className="chip">{selectedCliente.nombres} {selectedCliente.apellidos}</span>
                      <button className="btn-secondary sm" onClick={limpiarCliente}>Cambiar</button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>N° Seguimiento</label>
                  <div className="field-inline">
                    <input type="text" value={nuevo.seguimiento} readOnly placeholder="Se generará automáticamente" />
                    <button className="btn-secondary" onClick={generarSeguimiento}>Generar</button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Vehículo</label>
                  <div className="field-inline two">
                    <input type="text" value={nuevo.placa} readOnly placeholder="Placa" />
                    <select 
                      value={nuevo.tipo} 
                      onChange={(e) => setNuevo(prev => ({ ...prev, tipo: e.target.value }))}
                      className="select-tipo"
                    >
                      <option value="Automóvil">Automóvil</option>
                      <option value="Moto">Moto</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={nuevo.fecha}
                    onChange={(e) => setNuevo(prev => ({ ...prev, fecha: e.target.value }))}
                  />
                </div>

                <div className="form-group full">
                  <label>Servicios *</label>
                  <div className="services-checks">
                    {serviciosStore.map((srv) => (
                      <label key={srv.id_servicio}>
                        <input
                          type="checkbox"
                          checked={nuevo.servicios.includes(srv.id_servicio)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNuevo(prev => ({ ...prev, servicios: [...prev.servicios, srv.id_servicio] }));
                            } else {
                              setNuevo(prev => ({ ...prev, servicios: prev.servicios.filter(s => s !== srv.id_servicio) }));
                            }
                          }}
                        />
                        {srv.nombre}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group full">
                  <label>Observaciones</label>
                  <textarea
                    rows={4}
                    placeholder="Notas, detalles o consideraciones..."
                    value={nuevo.detalles}
                    onChange={(e) => setNuevo(prev => ({ ...prev, detalles: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModalNuevo(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardarNuevo}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aviso */}
      {modalAviso && (
        <div className="overlay" onClick={() => setModalAviso(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>{modalAviso}</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setModalAviso(null)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
