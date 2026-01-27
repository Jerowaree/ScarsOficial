import { useMemo, useState } from "react";
import "./TrazabilidadPage.css";
import { getSeguimientoByCode } from "../../features/seguimiento/api";
import { useSEO } from "../../hooks/useSEO";


import g1 from "../../assets/galeria/PoloScars1.png";
import g5 from "../../assets/galeria/GorraScars.jpg";
import g3 from "../../assets/galeria/polo2.jpg";
import g4 from "../../assets/galeria/fotitoscars.png";
import g2 from "../../assets/galeria/chompabuzo1.jpg";
import g6 from "../../assets/galeria/Llaveroscars1.png";

// Datos de merchandising (puedes reemplazar con imágenes reales)
const MERCHANDISING_DATA = [
  {
    id: 1,
    name: "Camiseta SCARS",
    image: g1,
    description: "Camiseta oficial con logo bordado"
  },
  {
    id: 2,
    name: "Buzo SCARS",
    image: g2,
    description: "Buzo completo Scars"
  },
  {
    id: 3,
    name: "Polo SCARS",
    image: g3,
    description: "Taza de cerámica personalizada"
  },
  {
    id: 4,
    name: "Sticker Pack",
    image: g4,
    description: "Pack de 5 stickers"
  },
  {
    id: 5,
    name: "Gorra SCARS",
    image: g5,
    description: "Gorra ajustable con logo"
  },
  {
    id: 6,
    name: "Stickers SCARS",
    image: g6,
    description: "Packs de Stickers SCARS"
  }
];

export default function TrazabilidadPage() {
  useSEO("trazabilidad");
  const IMGS = useMemo(() => [g1, g2, g3, g4, g5, g6], []);
  // const [playing, setPlaying] = useState(true); // Unused
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* eslint-disable no-unused-vars */
  const normalizeTipo = (value) => {
    const v = String(value || "");
    if (v === "Automovil" || v === "Autom_vil" || /autom[-_]?vil/i.test(v)) return "Automóvil";
    return v === "Moto" ? "Moto" : v.replace(/[-_]+/g, " ");
  };
  /* eslint-enable no-unused-vars */

  const cleanPart = (v) => {
    const s = String(v || "").replace(/[-_]+/g, " ").trim();
    if (!s || s.toLowerCase() === "no especificado") return "";
    return s;
  };

  // Procesos/etapas del taller mecánico
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

  const PROCESOS_ICONOS = {
    "Recepción del vehículo": "🚗",
    "Diagnóstico técnico": "🔧",
    "Evaluación y presupuesto": "📋",
    "Aprobación del cliente": "✅",
    "En espera de suministro": "⏳",
    "Ejecución del servicio": "⚙️",
    "Control de calidad": "✔️",
    "Entrega del vehículo": "🚙",
    "Cierre del servicio": "🎉",
  };

  // Normalizar estado
  const normalizeEstado = (value) => {
    const s = String(value || "").replace(/[-_]+/g, " ").trim().toLowerCase();
    if (s === "en curso" || s === "en_curso") return "En curso";
    if (s === "finalizado") return "Finalizado";
    if (s === "cancelado") return "Cancelado";
    return String(value || "").replace(/[-_]+/g, " ") || "En curso";
  };

  // Transformar respuesta del backend al formato esperado por el frontend
  const transformSeguimiento = (data) => {
    if (!data) return null;

    const procesoActual = data.proceso || "Recepción del vehículo";
    const procesoIndex = PROCESOS.findIndex(p =>
      p.toLowerCase().replace(/[\sáéíóúñ]/g, '') === procesoActual.toLowerCase().replace(/[\sáéíóúñ_]/g, '')
    );

    const etapas = PROCESOS.map((proceso, index) => {
      const isCompletado = index < procesoIndex;
      const isEnProceso = index === procesoIndex;

      return {
        nombre: proceso,
        descripcion: isEnProceso ? "Proceso actual en curso" : isCompletado ? "Completado" : "Pendiente",
        completado: isCompletado,
        enProceso: isEnProceso,
        icono: PROCESOS_ICONOS[proceso] || "🔧",
        fechaCompletado: isCompletado && index === 0 ? data.fecha : null,
      };
    });

    return {
      codigo: data.numero_seguimiento,
      cliente: {
        nombre: data.cliente_nombre || (data.clientes ? `${data.clientes.nombres} ${data.clientes.apellidos}` : 'N/A'),
      },
      vehiculo: {
        marca: data.vehiculos?.marca || null,
        modelo: data.vehiculos?.modelo || null,
        año: data.vehiculos?.anio || null,
        tipo: data.tipo || null,
      },
      fechaIngreso: data.fecha || new Date(),
      estado: normalizeEstado(data.estado || "En curso"),
      proceso: procesoActual,
      etapas,
    };
  };

  // Documentación UI/UX: El input de trazabilidad está claramente separado, con feedback y accesibilidad
  const handleCodigoSubmit = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setResultado(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSeguimientoByCode(codigo.trim());
      const transformed = transformSeguimiento(data);
      if (!transformed) {
        throw new Error("No se encontró información para este código");
      }
      setResultado(transformed);
    } catch (err) {
      // Mostramos un mensaje amigable indicando que la función estará lista pronto
      setError("¡Muy pronto podrás seguir el progreso de tu vehículo aquí mismo! 🚀 Por ahora, estamos afinando los últimos detalles. Si deseas una actualización inmediata, llámanos con gusto al 956 264 937.");
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="traz-page">
      {/* Hero Section Mejorado */}
      <section className="traz-hero">
        <div className="traz-hero-content">
          <div className="traz-hero-text">
            <h1 className="traz-hero-title">
              <span>Seguimiento en</span>
              <span>Tiempo Real</span>
            </h1>
            <p className="traz-hero-subtitle">
              Monitorea el progreso de tu vehículo las 24 horas del día,
              los 7 días de la semana desde cualquier lugar.
            </p>
            <div className="traz-hero-stats">
              <div className="traz-stat">
                <span className="traz-stat-number">100+</span>
                <span className="traz-stat-label">Vehículos Rastreados</span>
              </div>
              <div className="traz-stat">
                <span className="traz-stat-number">24/7</span>
                <span className="traz-stat-label">Disponibilidad</span>
              </div>
              <div className="traz-stat">
                <span className="traz-stat-number">100%</span>
                <span className="traz-stat-label">Precisión</span>
              </div>
            </div>
          </div>
          <div className="traz-hero-visual">
            <div className="traz-phone-mockup">
              <div className="phone-screen">
                <div className="phone-header">SCARS Tracker</div>
                <div className="phone-content">
                  <div className="tracking-item active">
                    <div className="tracking-icon">✓</div>
                    <div className="tracking-text">Recepción</div>
                  </div>
                  <div className="tracking-item active">
                    <div className="tracking-icon">🔧</div>
                    <div className="tracking-text">Diagnóstico</div>
                  </div>
                  <div className="tracking-item pending">
                    <div className="tracking-icon">⚙️</div>
                    <div className="tracking-text">Reparación</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <header className="traz-header container">
        <h1 className="traz-title">
          CONSULTA TU CÓDIGO
          <i className="traz-underline" />
        </h1>
      </header>

      {/* Apartado de seguimiento de códigos */}
      <div className="traz-seguimiento container" aria-label="Seguimiento de códigos">
        <form className="traz-form" onSubmit={handleCodigoSubmit}>
          <label htmlFor="codigo" className="traz-label">Ingresa tu código de seguimiento:</label>
          <input
            id="codigo"
            type="text"
            className="traz-input"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Ej: ABC123"
            required
            aria-describedby="traz-feedback"
          />
          <button type="submit" className="traz-btn" disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </form>
        <div id="traz-feedback" className="traz-feedback" aria-live="polite">
          {error && <span className="traz-success">{error}</span>}
        </div>

        {/* Sistema de seguimiento visual mejorado */}
        {resultado && !error && (
          <div className="traz-tracking-container">
            <div className="traz-tracking-header">
              <h3>Estado del Vehículo</h3>
              <div className="traz-tracking-code">Código: {codigo}</div>
            </div>

            <div className="traz-tracking-info">
              <div className="traz-info-grid">
                <div className="traz-info-item">
                  <span className="traz-info-label">Cliente</span>
                  <span className="traz-info-value">{resultado.cliente?.nombre}</span>
                </div>
                <div className="traz-info-item">
                  <span className="traz-info-label">Vehículo</span>
                  <span className="traz-info-value">
                    {[
                      cleanPart(resultado.vehiculo?.marca),
                      cleanPart(resultado.vehiculo?.modelo),
                    ].filter(Boolean).join(" ")}
                  </span>
                </div>
                <div className="traz-info-item">
                  <span className="traz-info-label">Fecha Ingreso</span>
                  <span className="traz-info-value">
                    {resultado.fechaIngreso
                      ? new Date(resultado.fechaIngreso).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        timeZone: 'UTC'
                      })
                      : '—'}
                  </span>
                </div>
                <div className="traz-info-item">
                  <span className="traz-info-label">Estado Actual</span>
                  <span className="traz-info-value">{resultado.estado}</span>
                </div>
              </div>
            </div>

            {/* Timeline Visual */}
            <div className="traz-timeline">
              {resultado.etapas?.map((etapa, index) => (
                <div
                  key={index}
                  className={`traz-timeline-step ${etapa.completado ? 'completed' :
                    etapa.enProceso ? 'active' : 'pending'
                    }`}
                >
                  <div className="traz-step-icon">
                    <span>{etapa.icono || '🔧'}</span>
                  </div>
                  <div className="traz-step-content">
                    <h4>{etapa.nombre}</h4>
                    <p>{etapa.descripcion}</p>
                    <span className="traz-step-date">
                      {etapa.nombre === 'Recepción del vehículo'
                        ? (etapa.fechaCompletado ? new Date(etapa.fechaCompletado).toLocaleString('es-PE', { timeZone: 'UTC' }) : '—')
                        : (etapa.enProceso ? 'En progreso' : (etapa.completado ? 'Completado' : 'Pendiente'))
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* Sección de Merchandising */}
      <div className="merch-section">
        <header className="merch-header container">
          <h2 className="merch-title">
            MERCHANDISING
            <i className="merch-underline" />
          </h2>
          <p className="merch-subtitle">Productos oficiales SCARS</p>
        </header>

        <div className="merch-grid container">
          {MERCHANDISING_DATA.map((item) => (
            <div className="merch-card" key={item.id}>
              <div className="merch-image-container">
                <img src={item.image} alt={item.name} className="merch-image" />
              </div>
              <div className="merch-info">
                <h3 className="merch-name">{item.name}</h3>
                <p className="merch-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Sección de Preguntas Frecuentes */}
      <section className="traz-faq container" aria-label="Preguntas frecuentes">
        <h2 className="traz-faq-title">Preguntas Frecuentes</h2>
        <ul className="traz-faq-list">
          <li>
            <strong>¿Qué hago si mi código no funciona?</strong>
            <p>Verifica que lo hayas escrito correctamente. Si el problema persiste, contáctanos por WhatsApp o correo.</p>
          </li>
          <li>
            <strong>¿Cuánto tarda el proceso de reparación?</strong>
            <p>El tiempo depende del diagnóstico y disponibilidad de repuestos. Puedes consultar avances en esta página.</p>
          </li>
          <li>
            <strong>¿Cómo recibo actualizaciones?</strong>
            <p>Te notificaremos por WhatsApp y correo cada vez que tu servicio avance de etapa.</p>
          </li>
          <li>
            <strong>¿Puedo consultar el estado fuera del horario?</strong>
            <p>Sí, la trazabilidad está disponible 24/7 en esta web.</p>
          </li>
        </ul>
      </section>
    </section>
  );
}
