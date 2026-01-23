import { useEffect, useMemo, useState } from "react";
import { Filter, X, Search, Edit, Trash2, Plus, CarFront } from "lucide-react";
import "./Clientes.css";

import {
  listClientes,
  createClienteWithVehiculo,
  updateClienteWithVehiculo,
  deleteCliente,
} from "@/features/clientes/api";

/* ================== helpers: mapeos & util ================== */

const GENEROS = ["Masculino", "Femenino", "No especificado"];

const mapGeneroToDB = (g) =>
  !g ? null : g === "No especificado" ? "No_especificado" : g;

const mapGeneroFromDB = (g) =>
  !g ? "" : g === "No_especificado" ? "No especificado" : g;

const vehTipoUItoDB = (t) => (t === "Automóvil" ? "Automovil" : "Moto");

/** yyyy-mm-dd desde Date/ISO/"" */
const toInputDate = (v) => {
  if (!v) return "";
  // si ya viene yyyy-mm-dd, lo devolvemos
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** CLI001, CLI002, ... según los códigos existentes */
function generarCodigoCliente(existentes) {
  let n = 1;
  while (existentes.has(`CLI${String(n).padStart(3, "0")}`)) n++;
  return `CLI${String(n).padStart(3, "0")}`;
}

/* ================== UI types ================== */

const TIPOS_VEHICULO = ["Automóvil", "Moto"];

export default function Clientes() {
  /* ===== STATE ===== */
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [modalAviso, setModalAviso] = useState(null); // Estado para mensajes de error/aviso

  // Form state
  const [formData, setFormData] = useState({
    codigo: "",
    nombres: "",
    apellidos: "",
    dni: "",
    telefono: "",
    correo: "",
    direccion: "",
    genero: "No especificado",
    fecha_nacimiento: "",
    vehiculo_placa: "",
    vehiculo_tipo: "Automóvil",
    vehiculo_marca: "",
    vehiculo_modelo: "",
    vehiculo_ano: "",
    vehiculo_color: "",
  });

  // Filters
  const [filters, setFilters] = useState({
    genero: "",
    tipoVehiculo: "",
    tieneVehiculo: "",
  });

  /* ===== DATA LOAD ===== */
  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await listClientes();
      console.log("=== DATOS RECIBIDOS DEL BACKEND ===");
      console.log("Clientes data:", data);
      if (data && data.length > 0) {
        console.log("Primer cliente completo:", JSON.stringify(data[0], null, 2));
        console.log("¿Tiene vehículo?", data[0].vehiculo ? "SÍ" : "NO");
        if (data[0].vehiculo) {
          console.log("Datos del vehículo:", data[0].vehiculo);
        }
        // Verificar todos los clientes
        data.forEach((cliente, index) => {
          console.log(`Cliente ${index + 1} (${cliente.nombres}):`, cliente.vehiculo ? "CON vehículo" : "SIN vehículo");
          if (cliente.vehiculo) {
            console.log(`  - Placa: ${cliente.vehiculo.placa}`);
            console.log(`  - Tipo: ${cliente.vehiculo.tipo}`);
          }
        });
      }
      setClientes(data || []);
    } catch (error) {
      console.error("Error loading clientes:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  /* ===== HELPERS ===== */
  const resetForm = () => {
    const existentes = new Set(clientes.map(c => c.codigo));
    setFormData({
      codigo: generarCodigoCliente(existentes),
      nombres: "",
      apellidos: "",
      dni: "",
      telefono: "",
      correo: "",
      direccion: "",
      genero: "No especificado",
      fecha_nacimiento: "",
      vehiculo_placa: "",
      vehiculo_tipo: "Automóvil",
      vehiculo_marca: "",
      vehiculo_modelo: "",
      vehiculo_ano: "",
      vehiculo_color: "",
    });
    setEditingId(null);
    setShowForm(false); // Ocultar formulario
  };

  const showNewForm = () => {
    const existentes = new Set(clientes.map(c => c.codigo));
    setFormData({
      codigo: generarCodigoCliente(existentes),
      nombres: "",
      apellidos: "",
      dni: "",
      telefono: "",
      correo: "",
      direccion: "",
      genero: "No especificado",
      fecha_nacimiento: "",
      vehiculo_placa: "",
      vehiculo_tipo: "Automóvil",
      vehiculo_marca: "",
      vehiculo_modelo: "",
      vehiculo_ano: "",
      vehiculo_color: "",
    });
    setEditingId(null);
    setShowForm(true); // Mostrar formulario para nuevo cliente
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.nombres || !formData.apellidos) {
      alert("Los campos Nombres y Apellidos son obligatorios");
      return;
    }

    try {
      // Separar datos del cliente y del vehículo
      const fechaNacimiento = formData.fecha_nacimiento ?
        new Date(formData.fecha_nacimiento + 'T00:00:00.000Z').toISOString() :
        null;

      console.log("Fecha original:", formData.fecha_nacimiento);
      console.log("Fecha convertida:", fechaNacimiento);

      const clienteData = {
        codigo: formData.codigo,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        celular: formData.telefono, // Mapear telefono -> celular
        correo: formData.correo,
        direccion: formData.direccion,
        genero: mapGeneroToDB(formData.genero),
        fecha_nacimiento: fechaNacimiento,
        ruc: null, // Campo opcional
        fecha_registro: null, // Se asignará automáticamente en el backend
      };

      // Verificar si hay datos del vehículo
      const hasVehicleData = formData.vehiculo_placa ||
        formData.vehiculo_marca ||
        formData.vehiculo_modelo ||
        formData.vehiculo_ano ||
        formData.vehiculo_color;

      const vehiculoData = hasVehicleData ? {
        placa: formData.vehiculo_placa || null,
        tipo: vehTipoUItoDB(formData.vehiculo_tipo),
        marca: formData.vehiculo_marca || null,
        modelo: formData.vehiculo_modelo || null,
        anio: formData.vehiculo_ano ? parseInt(formData.vehiculo_ano) : null,
        color: formData.vehiculo_color || null,
      } : null;

      console.log("=== DATOS DEL FORMULARIO ===");
      console.log("vehiculo_placa:", formData.vehiculo_placa);
      console.log("vehiculo_tipo:", formData.vehiculo_tipo);
      console.log("vehiculo_marca:", formData.vehiculo_marca);
      console.log("vehiculo_modelo:", formData.vehiculo_modelo);
      console.log("vehiculo_ano:", formData.vehiculo_ano);
      console.log("vehiculo_color:", formData.vehiculo_color);
      console.log("hasVehicleData:", hasVehicleData);

      console.log("=== VEHICULO DATA CONSTRUIDO ===");
      console.log("vehiculoData:", vehiculoData);

      const payload = {
        cliente: clienteData,
        vehiculo: vehiculoData
      };

      console.log("=== PAYLOAD COMPLETO ===");
      console.log("Payload estructurado:", JSON.stringify(payload, null, 2));

      if (editingId) {
        // Modo edición - actualizar cliente y vehículo
        await updateClienteWithVehiculo(editingId, payload);
        alert("Cliente y vehículo actualizados correctamente");
      } else {
        // Modo creación - usar estructura completa
        const result = await createClienteWithVehiculo(payload);
        console.log("Cliente creado correctamente:", result);
        alert("Cliente creado correctamente");
      }

      await loadClientes();
      resetForm();
    } catch (error) {
      console.error("Error al guardar cliente:", error);

      // Manejar errores de validación de Zod
      if (error.response?.data?.error === "VALIDATION_ERROR") {
        const details = error.response.data.details;
        const messages = details.map(d => `${d.path.join('.')}: ${d.message}`).join("\n");
        alert("Error de validación:\n" + messages);
      } else if (error.response?.data?.error === "DUPLICATE_ERROR") {
        alert("Dato duplicado: " + error.response.data.message);
      } else {
        alert("Error al procesar la solicitud: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (cliente) => {
    console.log("=== EDITANDO CLIENTE ===");
    console.log("Cliente seleccionado:", JSON.stringify(cliente, null, 2));
    console.log("¿Tiene vehículo?", cliente.vehiculo ? "SÍ" : "NO");
    if (cliente.vehiculo) {
      console.log("Datos del vehículo:", cliente.vehiculo);
    }

    setFormData({
      codigo: cliente.codigo || "",
      nombres: cliente.nombres || "",
      apellidos: cliente.apellidos || "",
      dni: cliente.dni || "",
      telefono: cliente.celular || "", // Mapear celular -> telefono para el formulario
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
      genero: mapGeneroFromDB(cliente.genero) || "No especificado",
      fecha_nacimiento: toInputDate(cliente.fecha_nacimiento) || "",
      vehiculo_placa: cliente.vehiculo?.placa || "",
      vehiculo_tipo: cliente.vehiculo?.tipo === "Automovil" || cliente.vehiculo?.tipo === "Autom_vil" ? "Automóvil" : "Moto",
      vehiculo_marca: cliente.vehiculo?.marca || "",
      vehiculo_modelo: cliente.vehiculo?.modelo || "",
      vehiculo_ano: cliente.vehiculo?.anio || "", // Cambié 'ano' por 'anio'
      vehiculo_color: cliente.vehiculo?.color || "",
    });

    console.log("=== DATOS DEL FORMULARIO DESPUÉS DE SETEAR ===");
    console.log("vehiculo_placa:", cliente.vehiculo?.placa || "");
    console.log("vehiculo_tipo:", (cliente.vehiculo?.tipo === "Automovil" || cliente.vehiculo?.tipo === "Autom_vil") ? "Automóvil" : "Moto");
    console.log("vehiculo_marca:", cliente.vehiculo?.marca || "");
    console.log("vehiculo_modelo:", cliente.vehiculo?.modelo || "");
    console.log("vehiculo_ano:", cliente.vehiculo?.anio || "");
    console.log("vehiculo_color:", cliente.vehiculo?.color || "");

    setEditingId(cliente.id_cliente);
    setShowForm(true); // Mostrar formulario para editar
  };

  /* ===== DELETE ===== */
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCliente(deletingId);
      await loadClientes();
      setDeletingId(null);
      // Opcional: mostrar toast de éxito
      // toast.success("Cliente eliminado correctamente");
    } catch (error) {
      console.error("Error deleting cliente:", error);
      const msg = error.response?.data?.message || "Error al eliminar cliente";
      setModalAviso(msg); // Usamos setModalAviso para mostrar el error al usuario
      setDeletingId(null); // Cerramos el modal de confirmación
    }
  };

  /* ===== FILTERED DATA ===== */
  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = !search ||
        cliente.nombres?.toLowerCase().includes(searchLower) ||
        cliente.apellidos?.toLowerCase().includes(searchLower) ||
        cliente.dni?.toLowerCase().includes(searchLower) ||
        cliente.correo?.toLowerCase().includes(searchLower) ||
        cliente.codigo?.toLowerCase().includes(searchLower);

      // Gender filter
      const matchesGender = !filters.genero ||
        mapGeneroFromDB(cliente.genero) === filters.genero;

      // Vehicle type filter
      const matchesVehicleType = !filters.tipoVehiculo ||
        ((cliente.vehiculo?.tipo === "Automovil" || cliente.vehiculo?.tipo === "Autom_vil") && filters.tipoVehiculo === "Automóvil") ||
        (cliente.vehiculo?.tipo === "Moto" && filters.tipoVehiculo === "Moto");

      // Has vehicle filter
      const matchesHasVehicle = filters.tieneVehiculo === "" ||
        (filters.tieneVehiculo === "si" && cliente.vehiculo) ||
        (filters.tieneVehiculo === "no" && !cliente.vehiculo);

      return matchesSearch && matchesGender && matchesVehicleType && matchesHasVehicle;
    });
  }, [clientes, search, filters]);

  /* ===== RENDER ===== */
  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <h1>Gestión de Clientes</h1>
        <button className="btn-primary" onClick={showNewForm}>
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="clientes-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, correo o código..."
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
            <label>Género:</label>
            <select
              value={filters.genero}
              onChange={(e) => setFilters(prev => ({ ...prev, genero: e.target.value }))}
            >
              <option value="">Todos</option>
              {GENEROS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Tipo Vehículo:</label>
            <select
              value={filters.tipoVehiculo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
            >
              <option value="">Todos</option>
              {TIPOS_VEHICULO.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Tiene Vehículo:</label>
            <select
              value={filters.tieneVehiculo}
              onChange={(e) => setFilters(prev => ({ ...prev, tieneVehiculo: e.target.value }))}
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
        <div className="clientes-form">
          <div className="form-header">
            <h2>{editingId ? "Editar Cliente" : "Nuevo Cliente"}</h2>
            <button className="btn-close" onClick={resetForm}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-section">
                <h3>Datos Personales</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Código:</label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      readOnly
                      className="readonly"
                    />
                  </div>
                  <div className="form-group">
                    <label>DNI:</label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombres:</label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellidos:</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo:</label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Género:</label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleInputChange}
                    >
                      {GENEROS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha Nacimiento:</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Dirección:</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Datos del Vehículo</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Placa:</label>
                    <input
                      type="text"
                      name="vehiculo_placa"
                      value={formData.vehiculo_placa}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo:</label>
                    <select
                      name="vehiculo_tipo"
                      value={formData.vehiculo_tipo}
                      onChange={handleInputChange}
                    >
                      {TIPOS_VEHICULO.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Marca:</label>
                    <input
                      type="text"
                      name="vehiculo_marca"
                      value={formData.vehiculo_marca}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Modelo:</label>
                    <input
                      type="text"
                      name="vehiculo_modelo"
                      value={formData.vehiculo_modelo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Año:</label>
                    <input
                      type="text"
                      name="vehiculo_ano"
                      value={formData.vehiculo_ano}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Color:</label>
                    <input
                      type="text"
                      name="vehiculo_color"
                      value={formData.vehiculo_color}
                      onChange={handleInputChange}
                    />
                  </div>
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
      <div className="clientes-table">
        {loading ? (
          <div className="loading">Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>DNI</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Género</th>
                <th>Vehículo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map(cliente => (
                <tr key={cliente.id_cliente}>
                  <td>{cliente.codigo}</td>
                  <td>{cliente.dni}</td>
                  <td>{`${cliente.nombres} ${cliente.apellidos}`}</td>
                  <td>{cliente.celular}</td>
                  <td>{cliente.correo}</td>
                  <td>{mapGeneroFromDB(cliente.genero)}</td>
                  <td>
                    {(() => {
                      console.log(`Renderizando vehículo para cliente ${cliente.nombres}:`, cliente.vehiculo);
                      return cliente.vehiculo ? (
                        <div className="vehiculo-info">
                          <CarFront size={16} />
                          <span>{cliente.vehiculo.placa}</span>
                          <small>{(cliente.vehiculo.tipo === "Automovil" || cliente.vehiculo.tipo === "Autom_vil") ? "Automóvil" : "Moto"}</small>
                        </div>
                      ) : (
                        <span className="no-vehiculo">Sin vehículo</span>
                      );
                    })()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(cliente)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeletingId(cliente.id_cliente)}
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

        {!loading && filteredClientes.length === 0 && (
          <div className="no-data">
            No se encontraron clientes
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Eliminación</h3>
            <p>¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.</p>
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

      {/* Error/Info Modal */}
      {modalAviso && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Aviso</h3>
            <p className="modal-message">{modalAviso}</p>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => setModalAviso(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
