import { useEffect, useMemo, useState } from "react";
import { Filter, X, Search, Trash2, Plus } from "lucide-react";
import "./Servicios.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ===== Toast mini ===== */
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

const ALL_FIELDS = ["nombre", "descripcion", "precio", "estado"];
const REQUIRED_COLS = ["nombre", "precio"];

const labelFor = (key) => {
    switch (key) {
        case "nombre": return "Nombre";
        case "descripcion": return "Descripción";
        case "precio": return "Precio";
        case "estado": return "Estado";
        default: return key;
    }
};

export default function Servicios() {
    const { show: toast, node: toastNode } = useToasts();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visibleCols, setVisibleCols] = useState([...ALL_FIELDS]);
    const [showFilters, setShowFilters] = useState(false);
    const [query, setQuery] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [nuevo, setNuevo] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        estado: "Activo",
    });

    const fetchServicios = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/servicios/catalogo`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error del servidor:", errorData);
                throw new Error(`Error ${response.status}: ${errorData.message || 'Error al cargar servicios'}`);
            }

            const data = await response.json();
            setRows(data);
        } catch (error) {
            console.error("Error en fetchServicios:", error);
            toast(error.message, "err");
            // Datos de respaldo en caso de error
            const defaultData = [
                { id_servicio: 1, nombre: "Cambio de aceite", descripcion: "Cambio de aceite y filtro", precio: 50.00, estado: "Activo" },
                { id_servicio: 2, nombre: "Revisión de frenos", descripcion: "Inspección completa del sistema de frenos", precio: 80.00, estado: "Activo" },
            ];
            setRows(defaultData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return rows.filter((s) =>
            [s.nombre, s.descripcion, String(s.precio), s.estado].some((v) => String(v).toLowerCase().includes(q))
        );
    }, [rows, query]);

    const resetForm = () => {
        setNuevo({ nombre: "", descripcion: "", precio: "", estado: "Activo" });
        setShowNew(false);
    };

    const saveNew = async () => {
        if (!nuevo.nombre.trim()) {
            toast("El nombre es requerido.", "err");
            return;
        }
        if (!nuevo.precio || isNaN(nuevo.precio) || Number(nuevo.precio) <= 0) {
            toast("El precio es requerido y debe ser mayor a 0.", "err");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: nuevo.nombre.trim(),
                descripcion: nuevo.descripcion.trim(),
                precio: Number(nuevo.precio),
                estado: nuevo.estado
            };

            const response = await fetch(`${API_URL}/servicios/catalogo`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Error al crear servicio");
            }

            const createdServicio = await response.json();
            setRows(prev => [...prev, createdServicio]);
            resetForm();
            toast("Servicio creado exitosamente.");
        } catch (error) {
            console.error("Error creating servicio:", error);
            toast(error.message || "Error al crear servicio.", "err");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/servicios/${id}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Error al eliminar servicio");
            }

            setRows(prev => prev.filter(r => r.id_servicio !== id));
            setConfirmDelete(null);
            toast("Servicio eliminado exitosamente.");
        } catch (error) {
            console.error("Error deleting servicio:", error);
            toast(error.message || "Error al eliminar servicio.", "err");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="servicios-container">
            {toastNode}

            <div className="servicios-header">
                <h2>Servicios</h2>
                <div className="servicios-busqueda">
                    <Search size={16} className="icono-busqueda" />
                    <input
                        type="text"
                        placeholder="Buscar servicio..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowNew(true)}>
                        <Plus size={18} /> Nuevo
                    </button>
                    <button className="filter-btn" onClick={() => setShowFilters(true)}>
                        <Filter size={18} /> Filtros
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="servicios-table">
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
                            filtered.map((row) => (
                                <tr key={row.id_servicio}>
                                    {visibleCols.map((col) => {
                                        const val = row[col] ?? "";
                                        let displayVal = val;
                                        if (col === "precio") {
                                            displayVal = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
                                        }
                                        return (
                                            <td key={col} className="cell">
                                                <div className="cell-view">
                                                    <span>{displayVal}</span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="acciones">
                                        <button className="btn-danger" onClick={() => setConfirmDelete(row.id_servicio)}>
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

            {/* NUEVO SERVICIO */}
            {showNew && (
                <div className="overlay" onClick={() => setShowNew(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nuevo Servicio</h3>
                            <button className="close-btn" onClick={() => setShowNew(false)}><X size={18} /></button>
                        </div>
                        <div className="modal-grid two">
                            <label className="required">
                                Nombre
                                <input
                                    type="text"
                                    value={nuevo.nombre}
                                    onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                                    placeholder="Nombre del servicio"
                                />
                            </label>
                            <label className="required">
                                Precio
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={nuevo.precio}
                                    onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })}
                                    placeholder="0.00"
                                />
                            </label>
                            <label className="span-2">
                                Descripción
                                <textarea
                                    value={nuevo.descripcion}
                                    onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
                                    rows={3}
                                    placeholder="Descripción del servicio"
                                />
                            </label>
                            <label>
                                Estado
                                <select
                                    value={nuevo.estado}
                                    onChange={(e) => setNuevo({ ...nuevo, estado: e.target.value })}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={saveNew} disabled={loading}>
                                {loading ? "Guardando..." : "Guardar"}
                            </button>
                            <button className="btn-secondary" onClick={() => setShowNew(false)} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMAR ELIMINAR */}
            {confirmDelete && (
                <div className="overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Eliminar Servicio</h3>
                            <button className="close-btn" onClick={() => setConfirmDelete(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <p>¿Seguro que deseas eliminar este servicio?</p>
                        <div className="modal-actions">
                            <button className="btn-danger" onClick={() => handleDelete(confirmDelete)} disabled={loading}>
                                {loading ? "Eliminando..." : "Eliminar"}
                            </button>
                            <button className="btn-secondary" onClick={() => setConfirmDelete(null)} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}