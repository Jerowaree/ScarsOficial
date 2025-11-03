import "./Servicios.css";
import s1 from "../../assets/serv_1.jpg";
import s2 from "../../assets/serv_2.jpg";
import s3 from "../../assets/serv_3.jpg";

const SERVICES = [
  {
    id: 1,
    title: "Mecánica General",
    description: "Reparación completa de sistemas mecánicos con tecnología avanzada y repuestos originales.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 1 5.1 3L9 6.9L7.6 8.3L3.7 4.4C1.7 6.4 1.7 9.4 3.7 11.4C5.6 13.3 8.3 13.8 10.6 12.9L19.7 22C20.1 22.4 20.7 22.4 21.1 22L22.7 20.4C23.1 20 23.1 19.4 22.7 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    image: s1
  },
  {
    id: 2,
    title: "Mantenimiento Preventivo",
    description: "Revisiones programadas para prevenir fallas y mantener fresco tu vehículo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    image: s2
  },
  {
    id: 3,
    title: "Afinamiento Electrónico",
    description: "Optimización del rendimiento del motor mediante diagnóstico computarizado.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98ZM12 15.5C10.62 15.5 9.5 14.38 9.5 13C9.5 11.62 10.62 10.5 12 10.5C13.38 10.5 14.5 11.62 14.5 13C14.5 14.38 13.38 15.5 12 15.5Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    image: s3
  },
  {
    id: 4,
    title: "Detallado Automotriz",
    description: "Limpieza profunda y acabados que devuelven el brillo original a tu auto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/>
        <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    image: s1
  },
  {
    id: 5,
    title: "Suministros de Repuestos",
    description: "Repuestos originales y de alta calidad para todas las marcas de vehículos.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 11h4" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 16h4" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 11h.01" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 16h.01" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    image: s2
  },
  {
    id: 6,
    title: "Accesorios",
    description: "Personaliza tu vehículo con accesorios que mejoran estilo y funcionalidad.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    image: s3
  }
];

export default function Servicios(){
  return (
    <section id="servicios" className="section-full servicios">
      <div className="container">
        <div className="servicios__header">
          <h2 className="servicios__title">
            <span>NUESTROS</span>
            <span>SERVICIOS</span>
          </h2>
          <p className="servicios__subtitle">
            Soluciones completas para el cuidado y mantenimiento de tu vehículo
          </p>
        </div>

        <div className="servicios__grid">
          {SERVICES.map(service => (
            <div key={service.id} className="servicio__card">
              <div className="servicio__image">
                <img src={service.image} alt={service.title} />
              </div>
              
              <div className="servicio__content">
                <div className="servicio__icon">
                  {service.icon}
                </div>
                
                <div className="servicio__text">
                  <h3 className="servicio__title">{service.title}</h3>
                  <p className="servicio__description">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
