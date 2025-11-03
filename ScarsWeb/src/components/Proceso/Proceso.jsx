import "./Proceso.css";
import { useNavigate } from "react-router-dom";

const PROCESO_DATA = [
  {
    id: 1,
    numero: "01",
    titulo: "Consulta",
    descripcion: "Evaluamos tu vehículo y escuchamos tus necesidades específicas",
    detalles: [
      "Inspección visual inicial",
      "Historial del vehículo",
      "Diagnóstico de síntomas reportados",
      "Evaluación de costos aproximados"
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 2,
    numero: "02",
    titulo: "Diagnóstico",
    descripcion: "Realizamos un análisis técnico completo para identificar el problema exacto",
    detalles: [
      "Pruebas de diagnóstico computarizado",
      "Inspección de componentes mecánicos",
      "Análisis de fluidos y sistemas",
      "Reporte detallado de hallazgos"
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98ZM12 15.5C10.62 15.5 9.5 14.38 9.5 13C9.5 11.62 10.62 10.5 12 10.5C13.38 10.5 14.5 11.62 14.5 13C14.5 14.38 13.38 15.5 12 15.5Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 3,
    numero: "03",
    titulo: "Reparación",
    descripcion: "Ejecutamos el trabajo con técnicas especializadas y piezas de calidad",
    detalles: [
      "Reparación con herramientas profesionales",
      "Uso de repuestos originales o certificados",
      "Mano de obra especializada",
      "Control de calidad en cada paso"
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 1 5.1 3L9 6.9L7.6 8.3L3.7 4.4C1.7 6.4 1.7 9.4 3.7 11.4C5.6 13.3 8.3 13.8 10.6 12.9L19.7 22C20.1 22.4 20.7 22.4 21.1 22L22.7 20.4C23.1 20 23.1 19.4 22.7 19Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 4,
    numero: "04",
    titulo: "Entrega",
    descripcion: "Te devolvemos tu vehículo en perfectas condiciones con garantía",
    detalles: [
      "Prueba de funcionamiento completa",
      "Limpieza y detallado del vehículo",
      "Documentación de garantía",
      "Entrega con explicación del trabajo realizado"
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
      </svg>
    )
  }
];

export default function Proceso() {
  const navigate = useNavigate();

  const goToContactoForm = () => {
    navigate("/contacto");
    setTimeout(() => {
      const el = document.getElementById("contacto-form");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (el.elements && el.elements[0]) {
          el.elements[0].focus();
        }
      }
    }, 350);
  };

  return (
    <section id="proceso" className="proceso section-full">
      <div className="container">
        <div className="proceso-header">
          <h2 className="proceso-title">
            <span>NUESTRO</span>
            <span>PROCESO DE TRABAJO</span>
          </h2>
          <p className="proceso-subtitle">
            Un proceso estructurado que garantiza la calidad y satisfacción en cada reparación
          </p>
        </div>

        <div className="proceso-grid">
          {PROCESO_DATA.map((paso, index) => (
            <div key={paso.id} className="proceso-card">
              <div className="proceso-number">{paso.numero}</div>
              
              <div className="proceso-icon">
                {paso.icon}
              </div>
              
              <div className="proceso-content">
                <h3 className="proceso-titulo">{paso.titulo}</h3>
                <p className="proceso-descripcion">{paso.descripcion}</p>
                
                <ul className="proceso-detalles">
                  {paso.detalles.map((detalle, detalleIndex) => (
                    <li key={detalleIndex} className="proceso-detalle">
                      <span className="proceso-check">✓</span>
                      {detalle}
                    </li>
                  ))}
                </ul>
              </div>
              
              {index < PROCESO_DATA.length - 1 && (
                <div className="proceso-arrow">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="proceso-cta">
          <p className="proceso-cta-text">
            ¿Listo para comenzar? Agenda tu consulta inicial
          </p>
          <button className="proceso-btn" onClick={goToContactoForm}>
            Agendar Consulta
          </button>
        </div>
      </div>
    </section>
  );
}


