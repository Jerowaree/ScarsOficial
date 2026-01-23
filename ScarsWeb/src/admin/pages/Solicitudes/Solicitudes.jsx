import { useEffect, useState, useMemo } from "react";
import { Search, Mail, Phone, Car, User, Calendar } from "lucide-react";
import api from "../../../api/axios";
import { ENDPOINTS } from "../../../api/endpoints";
import "./Solicitudes.css";

/**
 * Formatea una fecha ISO o un objeto Date a un formato legible (dd/mm/yyyy hh:mm).
 * @param {string | Date} dateInput - La fecha a formatear.
 * @returns {string} La fecha formateada.
 */
const formatDateTime = (dateInput) => {
  if (!dateInput) return "N/A";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Fecha inválida";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return "Fecha inválida";
  }
};

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ENDPOINTS.solicitudes);
      // Ordenamos las solicitudes por fecha, de la más reciente a la más antigua
      // Usar creado_en en lugar de fecha_creacion según el schema
      const sortedData = (Array.isArray(response.data) ? response.data : []).sort((a, b) =>
        new Date(b.creado_en || b.fecha_creacion || 0) - new Date(a.creado_en || a.fecha_creacion || 0)
      );
      setSolicitudes(sortedData);
    } catch (err) {
      setError("No se pudieron cargar las solicitudes. Por favor, inténtalo de nuevo más tarde.");
      console.error("Error fetching solicitudes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const filteredSolicitudes = useMemo(() => {
    if (!search) return solicitudes;
    const lowercasedSearch = search.toLowerCase();
    return solicitudes.filter(s =>
      s.nombre?.toLowerCase().includes(lowercasedSearch) ||
      s.correo?.toLowerCase().includes(lowercasedSearch) ||
      s.numero?.toLowerCase().includes(lowercasedSearch) ||
      s.telefono?.toLowerCase().includes(lowercasedSearch) ||
      s.modelo?.toLowerCase().includes(lowercasedSearch) ||
      s.mensaje?.toLowerCase().includes(lowercasedSearch) ||
      s.detalle?.toLowerCase().includes(lowercasedSearch)
    );
  }, [search, solicitudes]);

  return (
    <section className="solicitudes-container">
      {/* HEADER */}
      <div className="solicitudes-header">
        <h1>Bandeja de Solicitudes</h1>
        <div className="actions">
          <input
            type="text"
            placeholder="Buscar por nombre, correo, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} />
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          Cargando solicitudes...
        </div>
      )}

      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="solicitudes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Mensaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolicitudes.length > 0 ? (
                filteredSolicitudes.map(solicitud => (
                  <tr key={solicitud.id_solicitud}>
                    <td className="mono">{solicitud.id_solicitud}</td>
                    <td>
                      <div className="cell-view">
                        <User size={14} />
                        <span>{solicitud.nombre || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-view">
                        <Mail size={14} />
                        <a href={`mailto:${solicitud.correo}`} className="link-email">
                          {solicitud.correo || '—'}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="cell-view">
                        <Phone size={14} />
                        <span>{solicitud.numero || solicitud.telefono || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-view">
                        <Car size={14} />
                        <span>{solicitud.modelo || '—'}</span>
                      </div>
                    </td>
                    <td className="mono">{solicitud.anio || '—'}</td>
                    <td className="message-cell">
                      <div className="message-text" title={solicitud.mensaje || solicitud.detalle || ''}>
                        {solicitud.mensaje || solicitud.detalle || 'Sin mensaje'}
                      </div>
                    </td>
                    <td>
                      <div className="cell-view">
                        <Calendar size={14} />
                        <span className="mono">{formatDateTime(solicitud.creado_en || solicitud.fecha_creacion)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="no-data-state">
                      <Mail size={48} />
                      <p>No hay solicitudes para mostrar.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
