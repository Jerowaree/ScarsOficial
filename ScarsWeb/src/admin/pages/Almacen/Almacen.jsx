import { useState, useEffect } from "react";
import { Package, Plus, Search, ArrowUpRight, ArrowDownLeft, AlertTriangle, History, Edit, X, Filter } from "lucide-react";
import "./Almacen.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Almacen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ categoria: "", stockStatus: "" });
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showMovModal, setShowMovModal] = useState(null);
    const [newItem, setNewItem] = useState({ nombre: "", categoria: "", descripcion: "", stock_minimo: 0, unidad_medida: "unidades" });
    const [movData, setMovData] = useState({ cantidad: 0, precio_unit: 0, observacion: "" });

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_URL}/almacen/items`, {
                credentials: "include" // Enviar cookies automáticamente
            });
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const url = editingItem
                ? `${API_URL}/almacen/items/${editingItem.id_item}`
                : `${API_URL}/almacen/items`;

            const res = await fetch(url, {
                method: editingItem ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newItem)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingItem(null);
                setNewItem({ nombre: "", categoria: "", descripcion: "", stock_minimo: 0, unidad_medida: "unidades" });
                fetchItems();
            }
        } catch (error) {
            // Silenciar error según solicitud
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItem({
            nombre: item.nombre,
            categoria: item.categoria || "",
            descripcion: item.descripcion || "",
            stock_minimo: Number(item.stock_minimo),
            unidad_medida: item.unidad_medida
        });
        setShowModal(true);
    };

    const handleRecordMov = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/almacen/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_item: showMovModal.item.id_item,
                    tipo: showMovModal.tipo,
                    ...movData
                })
            });
            if (res.ok) {
                setShowMovModal(null);
                setMovData({ cantidad: 0, precio_unit: 0, observacion: "" });
                fetchItems();
            }
        } catch (error) {
            // Silenciar error según solicitud
        }
    };

    // Filtrado avanzado
    const filteredItems = items.filter(item => {
        const matchesSearch = item.nombre.toLowerCase().includes(search.toLowerCase()) ||
            (item.categoria || "").toLowerCase().includes(search.toLowerCase());

        const matchesCategoria = !filters.categoria || item.categoria === filters.categoria;

        const stockActual = Number(item.stock_actual);
        const stockMinimo = Number(item.stock_minimo);
        const matchesStock = !filters.stockStatus ||
            (filters.stockStatus === "bajo" && stockActual <= stockMinimo) ||
            (filters.stockStatus === "normal" && stockActual > stockMinimo);

        return matchesSearch && matchesCategoria && matchesStock;
    });

    const stats = {
        total: items.length,
        lowStock: items.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo)).length,
        categories: new Set(items.map(i => i.categoria).filter(Boolean)).size
    };

    const categorias = [...new Set(items.map(i => i.categoria).filter(Boolean))];

    return (
        <div className="almacen-container">
            <header className="almacen-header">
                <h1>Inventario de Almacén</h1>
                <button className="btn-add" onClick={() => {
                    setEditingItem(null);
                    setNewItem({ nombre: "", categoria: "", descripcion: "", stock_minimo: 0, unidad_medida: "unidades" });
                    setShowModal(true);
                }}>
                    <Plus size={20} /> Nuevo Item
                </button>
            </header>

            {/* Buscador mejorado */}
            <div className="almacen-search-section">
                <div className="search-box-enhanced">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="clear-search" onClick={() => setSearch("")}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={filters.categoria}
                        onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={filters.stockStatus}
                        onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                        className="filter-select"
                    >
                        <option value="">Todo el stock</option>
                        <option value="bajo">Stock bajo</option>
                        <option value="normal">Stock normal</option>
                    </select>

                    {(filters.categoria || filters.stockStatus) && (
                        <button
                            className="clear-filters"
                            onClick={() => setFilters({ categoria: "", stockStatus: "" })}
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            <div className="almacen-stats">
                <div className="stat-card">
                    <div className="stat-icon blue"><Package size={24} /></div>
                    <div className="stat-info">
                        <h3>Total Items</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red"><AlertTriangle size={24} /></div>
                    <div className="stat-info">
                        <h3>Stock Bajo</h3>
                        <p>{stats.lowStock}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><Filter size={24} /></div>
                    <div className="stat-info">
                        <h3>Categorías</h3>
                        <p>{stats.categories}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">Cargando inventario...</div>
            ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                    <Package size={64} />
                    <p>No se encontraron items</p>
                </div>
            ) : (
                <div className="items-grid">
                    {filteredItems.map(item => (
                        <div key={item.id_item} className={`item-card ${Number(item.stock_actual) <= Number(item.stock_minimo) ? 'low-stock' : ''}`}>
                            <span className="item-badge">{item.unidad_medida}</span>
                            <span className="category">{item.categoria || "Sin categoría"}</span>
                            <h3>{item.nombre}</h3>
                            <p className="description">{item.descripcion || "Sin descripción"}</p>

                            <div className="stock-info">
                                <div className="current-stock">
                                    <span className="label">Stock Actual</span>
                                    <span className="value">{Number(item.stock_actual)}</span>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-icon" title="Entrada Stock" onClick={() => setShowMovModal({ item, tipo: 'ENTRADA' })}><ArrowUpRight size={18} /></button>
                                    <button className="btn-icon" title="Salida Stock" onClick={() => setShowMovModal({ item, tipo: 'SALIDA' })}><ArrowDownLeft size={18} /></button>
                                    <button className="btn-icon" title="Editar" onClick={() => handleEdit(item)}><Edit size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL CREAR/EDITAR ITEM */}
            {showModal && (
                <div className="overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingItem ? "Editar Item" : "Nuevo Repuesto / Producto"}</h3>
                            <button onClick={() => setShowModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleCreateOrUpdate}>
                            <div className="modal-content">
                                <div className="form-group">
                                    <label>Nombre *</label>
                                    <input type="text" required value={newItem.nombre} onChange={e => setNewItem({ ...newItem, nombre: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <input type="text" value={newItem.categoria} onChange={e => setNewItem({ ...newItem, categoria: e.target.value })} placeholder="Ej: Filtros, Aceites" />
                                </div>
                                <div className="form-group">
                                    <label>Unidad de Medida</label>
                                    <input type="text" value={newItem.unidad_medida} onChange={e => setNewItem({ ...newItem, unidad_medida: e.target.value })} placeholder="unidades, litros, etc." />
                                </div>
                                <div className="form-group">
                                    <label>Stock Mínimo (Alerta)</label>
                                    <input type="number" value={newItem.stock_minimo} onChange={e => setNewItem({ ...newItem, stock_minimo: Number(e.target.value) })} />
                                </div>
                                <div className="form-group full">
                                    <label>Descripción</label>
                                    <textarea rows={3} value={newItem.descripcion} onChange={e => setNewItem({ ...newItem, descripcion: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">{editingItem ? "Actualizar" : "Guardar"} Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL MOVIMIENTO */}
            {showMovModal && (
                <div className="overlay" onClick={() => setShowMovModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{showMovModal.tipo === 'ENTRADA' ? 'Entrada de Stock' : 'Salida de Stock'}</h3>
                            <p>{showMovModal.item.nombre}</p>
                            <button onClick={() => setShowMovModal(null)}><X /></button>
                        </div>
                        <form onSubmit={handleRecordMov}>
                            <div className="modal-content">
                                <div className="form-group">
                                    <label>Cantidad *</label>
                                    <input type="number" step="0.01" required value={movData.cantidad} onChange={e => setMovData({ ...movData, cantidad: Number(e.target.value) })} />
                                </div>
                                {showMovModal.tipo === 'ENTRADA' && (
                                    <div className="form-group">
                                        <label>Precio Unitario (Costo)</label>
                                        <input type="number" step="0.01" value={movData.precio_unit} onChange={e => setMovData({ ...movData, precio_unit: Number(e.target.value) })} />
                                    </div>
                                )}
                                <div className="form-group full">
                                    <label>Observación</label>
                                    <textarea rows={2} value={movData.observacion} onChange={e => setMovData({ ...movData, observacion: e.target.value })} placeholder="Ej: Compra a proveedor, Uso en servicio placa XYZ" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowMovModal(null)}>Cancelar</button>
                                <button type="submit" className={`btn-primary ${showMovModal.tipo === 'SALIDA' ? 'btn-danger' : ''}`}>
                                    Confirmar {showMovModal.tipo}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
