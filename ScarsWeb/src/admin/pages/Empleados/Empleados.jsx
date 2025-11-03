import { useEffect, useMemo, useState } from "react";
import { Filter, X, Search, Edit, Check, XCircle, Trash2, Plus } from "lucide-react";
import "./Empleados.css";

import { listEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from "@/features/empleados/api";

/* ============== Toast mini ============== */
let tid = 1;
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "ok") => {
    const id = tid++;
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  const node = (
    <div style={{ position: "fixed", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ background: t.type === "ok" ? "#16a34a" : "#e11d48", color: "#fff", padding: "10px 14px", borderRadius: 8, boxShadow: "0 6px 16px rgba(0,0,0,.15)" }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { show, node };
};
/* ======================================= */

/* === Columnas === */
const ALL_FIELDS = [
  "codigo",
  "nombres",
  "apellidos",
  "dni",
  "correo",
  "celular",
  "cargo",
  "sueldo",
  "horario",
  "estado",
];
const REQUIRED_COLS = ["codigo"];

const labelFor = (key) => {
  switch (key) {
    case "codigo": return "Código";
    case "dni": return "DNI";
    default: return key.charAt(0).toUpperCase() + key.slice(1);
  }
};

const HORARIOS = ["Mañana", "Tarde", "Mañana y Tarde"];
const ESTADOS = ["Activo", "Inactivo"];

export default function Empleados() {
  const { show: toast, node: toastNode } = useToasts();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [visibleCols, setVisibleCols] = useState([...ALL_FIELDS]);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState("");

  // Edición inline
  const [editing, setEditing] = useState(null);

  // Modal crear
  const [showNew, setShowNew] = useState(false);
  const [nuevo, setNuevo] = useState({
    // código lo genera backend
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    celular: "",
    cargo: "",
    sueldo: "",
    horario: "Mañana",
    estado: "Activo",
    id_usuario: null,
  });

  // Confirmar delete
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load inicial (con fix StrictMode)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await listEmpleados();
        if (!ignore) setRows(data);
      } catch (e) {
        if (e?.response?.status === 401) toast("No autenticado.", "err");
        else if (e?.response?.status === 403) toast("Sin permiso (empleado:list).", "err");
        else toast("No se pudieron cargar los empleados.", "err");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const toggleColumn = (col) => {
    if (REQUIRED_COLS.includes(col)) return;
    setVisibleCols((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col].sort((a, b) => ALL_FIELDS.indexOf(a) - ALL_FIELDS.indexOf(b))
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) =>
      [
        c.codigo,
        c.nombres,
        c.apellidos,
        c.dni ?? "",
        c.correo ?? "",
        c.celular ?? "",
        c.cargo ?? "",
        String(c.sueldo ?? ""),
        c.horario ?? "",
        c.estado ?? ""
      ].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  const startEdit = (i, field, value) => {
    if (field === "codigo") return;
    setEditing({ i, field, value });
  };
  const cancelEdit = () => setEditing(null);

  const commitEdit = async () => {
    if (!editing) return;
    const { i, field, value } = editing;
    const row = rows[i];
    if (!row) return;

    try {
      const payload = {};
      if (field === "sueldo") payload.sueldo = value;
      else if (field === "horario") payload.horario = value;
      else if (field === "estado") payload.estado = value;
      else payload[field] = value;

      const updated = await updateEmpleado(row.id_empleado, payload);

      const next = [...rows];
      next[i] = { ...row, ...updated };
      setRows(next);
      setEditing(null);
      toast("Empleado actualizado.");
    } catch (e) {
      if (e?.response?.status === 401) toast("No autenticado.", "err");
      else if (e?.response?.status === 403) toast("Sin permiso (empleado:update).", "err");
      else toast("No se pudo actualizar el empleado.", "err");
    }
  };

  const removeRow = async (i) => {
    const row = rows[i];
    if (!row) return;
    try {
      await deleteEmpleado(row.id_empleado);
      setRows(rows.filter((_, idx) => idx !== i));
      setConfirmDelete(null);
      toast("Empleado eliminado.");
    } catch (e) {
      if (e?.response?.status === 401) toast("No autenticado.", "err");
      else if (e?.response?.status === 403) toast("Sin permiso (empleado:delete).", "err");
      else toast("No se pudo eliminar el empleado.", "err");
    }
  };

  const openNew = () => {
    setNuevo({
      nombres: "",
      apellidos: "",
      dni: "",
      correo: "",
      celular: "",
      cargo: "",
      sueldo: "",
      horario: "Mañana",
      estado: "Activo",
      id_usuario: null,
    });
    setShowNew(true);
  };

  const saveNew = async () => {
    // Validaciones suaves (sin window.alert)
    if (!nuevo.nombres.trim() || !nuevo.apellidos.trim()) {
      toast("Completa Nombres y Apellidos.", "err");
      return;
    }
    if (nuevo.dni && nuevo.dni.replace(/\D/g, "").length !== 8) {
      toast("DNI debe tener 8 dígitos.", "err");
      return;
    }
    if (nuevo.celular && nuevo.celular.replace(/\D/g, "").length !== 9) {
      toast("Celular debe tener 9 dígitos.", "err");
      return;
    }

    try {
      const payload = {
        ...nuevo,
        dni: nuevo.dni ? nuevo.dni.replace(/\D/g, "").slice(0, 8) : "",
        celular: nuevo.celular ? nuevo.celular.replace(/\D/g, "").slice(0, 9) : "",
        sueldo: nuevo.sueldo === "" ? "" : String(nuevo.sueldo),
      };
      const created = await createEmpleado(payload);
      setRows((prev) => [created, ...prev]);
      setShowNew(false);
      toast("Empleado creado.");
    } catch (e) {
      if (e?.response?.status === 401) toast("No autenticado.", "err");
      else if (e?.response?.status === 403) toast("Sin permiso (empleado:create).", "err");
      else toast("No se pudo crear el empleado.", "err");
    }
  };

  return (
    <section className="empleados-container">
      {toastNode}

      {/* HEADER */}
      <div className="empleados-header">
        <h2>Empleados</h2>

        <div className="empleados-busqueda">
          <Search size={16} className="icono-busqueda" />
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button className="btn-primary" onClick={openNew}>
            <Plus size={18} /> Nuevo
          </button>
          <button className="filter-btn" onClick={() => setShowFilters(true)}>
            <Filter size={18} /> Filtros
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="table-wrapper">
        <table className="empleados-table">
          <thead>
            <tr>
              {visibleCols.map((col) => (
                <th key={col}>{labelFor(col)}</th>
              ))}
              <th className="acciones-col">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={visibleCols.length + 1}>Cargando…</td></tr>
            ) : filtered.length ? (
              filtered.map((row, i) => (
                <tr key={row.id_empleado}>
                  {visibleCols.map((col) => {
                    const isEditing = editing && editing.i === i && editing.field === col;
                    const val = row[col] ?? "";

                    if (col === "codigo") {
                      return (
                        <td key={col} className="cell">
                          <div className="cell-view">
                            <span className="mono">{val}</span>
                          </div>
                        </td>
                      );
                    }

                    const isSelectHorario = col === "horario";
                    const isSelectEstado = col === "estado";
                    const inputType = col === "sueldo" ? "number" : "text";

                    return (
                      <td key={col} className="cell">
                        {!isEditing ? (
                          <div className="cell-view">
                            <span>{val}</span>
                            <button
                              className="cell-edit-btn"
                              title="Editar"
                              onClick={() => startEdit(i, col, String(val))}
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="cell-edit">
                            {isSelectHorario ? (
                              <select
                                value={editing.value}
                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                              >
                                {HORARIOS.map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            ) : isSelectEstado ? (
                              <select
                                value={editing.value}
                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                              >
                                {ESTADOS.map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={inputType}
                                value={editing.value}
                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                              />
                            )}
                            <button className="cell-ok" title="Guardar" onClick={commitEdit}>
                              <Check size={14} />
                            </button>
                            <button className="cell-cancel" title="Cancelar" onClick={cancelEdit}>
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="acciones">
                    <button
                      className="btn-danger"
                      onClick={() => setConfirmDelete({ i, codigo: row.codigo })}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={visibleCols.length + 1}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FILTROS */}
      {showFilters && (
        <div className="overlay" onClick={() => setShowFilters(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mostrar columnas</h3>
              <button className="close-btn" onClick={() => setShowFilters(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="filter-grid">
              {ALL_FIELDS.map((field) => (
                <label key={field} className={REQUIRED_COLS.includes(field) ? "is-required" : ""}>
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(field)}
                    disabled={REQUIRED_COLS.includes(field)}
                    onChange={() => toggleColumn(field)}
                  />
                  {labelFor(field)}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NUEVO EMPLEADO (MODAL) */}
      {showNew && (
        <div className="overlay" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Empleado</h3>
              <button className="close-btn" onClick={() => setShowNew(false)}><X size={18} /></button>
            </div>

            <div className="modal-grid two">
              <label className="required">
                Nombres
                <input
                  type="text"
                  value={nuevo.nombres}
                  onChange={(e) => setNuevo({ ...nuevo, nombres: e.target.value })}
                />
              </label>

              <label className="required">
                Apellidos
                <input
                  type="text"
                  value={nuevo.apellidos}
                  onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })}
                />
              </label>

              <label>
                DNI
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={nuevo.dni ?? ""}
                  onChange={(e) => setNuevo({ ...nuevo, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                />
              </label>

              <label>
                Correo
                <input
                  type="email"
                  value={nuevo.correo ?? ""}
                  onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
                />
              </label>

              <label>
                Celular
                <input
                  type="tel"
                  value={nuevo.celular ?? ""}
                  onChange={(e) => setNuevo({ ...nuevo, celular: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                  placeholder="9 dígitos"
                />
              </label>

              <label>
                Cargo
                <input
                  type="text"
                  value={nuevo.cargo ?? ""}
                  onChange={(e) => setNuevo({ ...nuevo, cargo: e.target.value })}
                />
              </label>

              <label>
                Sueldo (S/)
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={nuevo.sueldo ?? ""}
                  onChange={(e) => setNuevo({ ...nuevo, sueldo: e.target.value })}
                />
              </label>

              <label>
                Horario
                <select
                  value={nuevo.horario ?? "Mañana"}
                  onChange={(e) => setNuevo({ ...nuevo, horario: e.target.value })}
                >
                  {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>

              <label>
                Estado
                <select
                  value={nuevo.estado ?? "Activo"}
                  onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value })}
                >
                  {ESTADOS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={saveNew}>Guardar</button>
              <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {confirmDelete && (
        <div className="overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Empleado</h3>
              <button className="close-btn" onClick={() => setConfirmDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <p>¿Seguro que deseas eliminar al empleado <strong>{confirmDelete.codigo}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={() => removeRow(confirmDelete.i)}>Eliminar</button>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
