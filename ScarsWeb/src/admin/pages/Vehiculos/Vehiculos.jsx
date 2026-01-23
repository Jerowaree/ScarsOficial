import { useEffect, useMemo, useState } from "react";
import { Filter, X, Search, Edit, Check, XCircle, Trash2, Plus } from "lucide-react";
import "./Vehiculos.css";

import { listVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from "@/features/vehiculos/api";
import { listClientes } from "@/features/clientes/api";

// =================== Toast minimal (no alerts nativas) ===================
let toastIdSeq = 1;
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "ok") => {
    const id = toastIdSeq++;
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  const node = (
    <div style={{
      position: "fixed", top: 12, right: 12, display: "flex",
      flexDirection: "column", gap: 8, zIndex: 9999
    }}>
      {toasts.map(t => (
        <div key={t.id}
          style={{
            background: t.type === "ok" ? "#16a34a" : "#e11d48",
            color: "white", padding: "10px 14px", borderRadius: 8,
            boxShadow: "0 6px 16px rgba(0,0,0,.15)", fontSize: 14, maxWidth: 360
          }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
  return { show, node };
};

// =================== Componente ===================
export default function Vehiculos() {
  const { show, node: toastNode } = useToasts();
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // Nuevo estado

  // Form state
  const [formData, setFormData] = useState({
    placa: "",
    tipo: "Automóvil",
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    id_cliente: "",
  });

  // Filters
  const [filters, setFilters] = useState({
    tipo: "",
    tieneCliente: "",
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiculosData, clientesData] = await Promise.all([
        listVehiculos(),
        listClientes()
      ]);
      setVehiculos(vehiculosData || []);
      setClientes(clientesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      show("Error al cargar datos", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      placa: "",
      tipo: "Automóvil",
      marca: "",
      modelo: "",
      anio: "",
      color: "",
      id_cliente: "",
    });
    setEditingId(null);
    setShowForm(false); // Ocultar formulario
  };

  const showNewForm = () => {
    resetForm();
    setShowForm(true); // Mostrar formulario para nuevo vehículo
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
      };

      if (editingId) {
        await updateVehiculo(editingId, payload);
        show("Vehículo actualizado correctamente", "ok");
      } else {
        await createVehiculo(payload);
        show("Vehículo creado correctamente", "ok");
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving vehiculo:", error);
      show("Error al guardar vehículo", "err");
    }
  };

  const handleEdit = (vehiculo) => {
    setFormData({
      placa: vehiculo.placa || "",
      tipo: vehiculo.tipo || "Automóvil",
      marca: vehiculo.marca || "",
      modelo: vehiculo.modelo || "",
      anio: vehiculo.anio || "",
      color: vehiculo.color || "",
      id_cliente: vehiculo.id_cliente || "",
    });
    setEditingId(vehiculo.id_vehiculo);
    setShowForm(true); // Mostrar formulario para editar
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteVehiculo(deletingId);
      show("Vehículo eliminado correctamente", "ok");
      await loadData();
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting vehiculo:", error);
      show("Error al eliminar vehículo", "err");
    }
  };

  // Filtered data
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter(vehiculo => {
      const searchLower = search.toLowerCase();
      const matchesSearch = !search ||
        vehiculo.placa?.toLowerCase().includes(searchLower) ||
        vehiculo.marca?.toLowerCase().includes(searchLower) ||
        vehiculo.modelo?.toLowerCase().includes(searchLower) ||
        vehiculo.color?.toLowerCase().includes(searchLower);

      const matchesTipo = !filters.tipo || vehiculo.tipo === filters.tipo;

      const matchesCliente = filters.tieneCliente === "" ||
        (filters.tieneCliente === "si" && vehiculo.id_cliente) ||
        (filters.tieneCliente === "no" && !vehiculo.id_cliente);

      return matchesSearch && matchesTipo && matchesCliente;
    });
  }, [vehiculos, search, filters]);

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find(c => c.id_cliente === idCliente);
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : "Sin asignar";
  };

  return (
    <div className="vehiculos-container">
      {toastNode}

      <div className="vehiculos-header">
        <h1>Gestión de Vehículos</h1>
        <button className="btn-primary" onClick={showNewForm}>
          <Plus size={20} />
          Nuevo Vehículo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="vehiculos-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por placa, marca, modelo o color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`btn-filter ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Tipo:</label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="Automóvil">Automóvil</option>
              <option value="Moto">Moto</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Asignado a cliente:</label>
            <select
              value={filters.tieneCliente}
              onChange={(e) => setFilters(prev => ({ ...prev, tieneCliente: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      )}

      {/* Form */}
      {(editingId || showForm) && (
        <div className="vehiculos-form">
          <div className="form-header">
            <h2>{editingId ? "Editar Vehículo" : "Nuevo Vehículo"}</h2>
            <button className="btn-close" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Placa:</label>
                  <input
                    type="text"
                    name="placa"
                    value={formData.placa}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo:</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                  >
                    <option value="Automóvil">Automóvil</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Marca:</label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Modelo:</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Año:</label>
                  <input
                    type="text"
                    name="anio"
                    value={formData.anio}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Color:</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cliente:</label>
                  <select
                    name="id_cliente"
                    value={formData.id_cliente}
                    onChange={handleInputChange}
                  >
                    <option value="">Sin asignar</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.codigo} - {cliente.nombres} {cliente.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="vehiculos-table">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Color</th>
                <th>Cliente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehiculos.map(vehiculo => (
                <tr key={vehiculo.id_vehiculo}>
                  <td className="placa-cell">{vehiculo.placa}</td>
                  <td>{vehiculo.tipo}</td>
                  <td>{vehiculo.marca}</td>
                  <td>{vehiculo.modelo}</td>
                  <td>{vehiculo.anio}</td>
                  <td>{vehiculo.color}</td>
                  <td>{getClienteNombre(vehiculo.id_cliente)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(vehiculo)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeletingId(vehiculo.id_vehiculo)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredVehiculos.length === 0 && (
          <div className="no-data">
            No se encontraron vehículos
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Eliminación</h3>
            <p>¿Está seguro que desea eliminar este vehículo? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeletingId(null)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
