import { useState, useEffect } from "react";
import "./Testimonios.css";

const TESTIMONIOS_DATA = [
  {
    id: 1,
    nombre: "María González",
    vehiculo: "Honda Civic 2020",
    servicio: "Mantenimiento General",
    testimonio: "Excelente servicio, muy profesionales. Mi auto quedó como nuevo. Definitivamente volveré y los recomendaré a mis amigos.",
    calificacion: 5,
    fecha: "Hace 2 semanas",
    foto: null
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    vehiculo: "Toyota Corolla 2019",
    servicio: "Reparación de Motor",
    testimonio: "Tenían el problema diagnosticado en menos de una hora. El trabajo fue impecable y el precio justo. Muy recomendados.",
    calificacion: 5,
    fecha: "Hace 1 mes",
    foto: null
  },
  {
    id: 3,
    nombre: "Ana Rodríguez",
    vehiculo: "Nissan Sentra 2021",
    servicio: "Cambio de Aceite y Filtros",
    testimonio: "Servicio rápido y eficiente. El personal es muy amable y explica todo claramente. Mi auto funciona perfecto.",
    calificacion: 5,
    fecha: "Hace 3 semanas",
    foto: null
  },
  {
    id: 4,
    nombre: "Luis Herrera",
    vehiculo: "Chevrolet Cruze 2018",
    servicio: "Reparación de Frenos",
    testimonio: "Trabajo de calidad excepcional. Me dieron garantía y explicaron todo el proceso. Muy satisfecho con el resultado.",
    calificacion: 5,
    fecha: "Hace 2 meses",
    foto: null
  },
  {
    id: 5,
    nombre: "Patricia Silva",
    vehiculo: "Ford Focus 2020",
    servicio: "Revisión Técnica",
    testimonio: "Profesionales de verdad. Detectaron un problema que otros talleres no vieron. Gracias por su honestidad y calidad.",
    calificacion: 5,
    fecha: "Hace 1 semana",
    foto: null
  },
  {
    id: 6,
    nombre: "Roberto Vega",
    vehiculo: "Suzuki Swift 2019",
    servicio: "Mantenimiento Preventivo",
    testimonio: "El mejor taller de la ciudad. Precios justos, trabajo de calidad y atención personalizada. 100% recomendado.",
    calificacion: 5,
    fecha: "Hace 4 semanas",
    foto: null
  }
];

export default function Testimonios() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === TESTIMONIOS_DATA.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonio = () => {
    setCurrentIndex(currentIndex === TESTIMONIOS_DATA.length - 1 ? 0 : currentIndex + 1);
  };

  const prevTestimonio = () => {
    setCurrentIndex(currentIndex === 0 ? TESTIMONIOS_DATA.length - 1 : currentIndex - 1);
  };

  const goToTestimonio = (index) => {
    setCurrentIndex(index);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  const currentTestimonio = TESTIMONIOS_DATA[currentIndex];

  return (
    <section id="testimonios" className="testimonios section-full">
      <div className="container">
        <div className="testimonios-header">
          <h2 className="testimonios-title">
            <span>LO QUE DICEN</span>
            <span>NUESTROS CLIENTES</span>
          </h2>
          <p className="testimonios-subtitle">
            La satisfacción de nuestros clientes es nuestra mejor carta de presentación
          </p>
        </div>

        <div className="testimonios-container">
          <div className="testimonios-main">
            <div className="testimonio-card">
              <div className="testimonio-header">
                <div className="testimonio-foto">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#fff"/>
                    <circle cx="12" cy="9.5" r="4" fill="#d7dbe2"/>
                    <ellipse cx="12" cy="17" rx="7" ry="4" fill="#d7dbe2"/>
                  </svg>
                </div>
                <div className="testimonio-info">
                  <h3 className="testimonio-nombre">{currentTestimonio.nombre}</h3>
                  <p className="testimonio-vehiculo">{currentTestimonio.vehiculo}</p>
                  <p className="testimonio-servicio">{currentTestimonio.servicio}</p>
                </div>
                <div className="testimonio-calificacion">
                  {renderStars(currentTestimonio.calificacion)}
                </div>
              </div>
              
              <blockquote className="testimonio-texto">
                "{currentTestimonio.testimonio}"
              </blockquote>
              
              <div className="testimonio-footer">
                <span className="testimonio-fecha">{currentTestimonio.fecha}</span>
              </div>
            </div>
          </div>

          <div className="testimonios-controls">
            <button 
              className="testimonios-btn prev"
              onClick={prevTestimonio}
              aria-label="Testimonio anterior"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="testimonios-dots">
              {TESTIMONIOS_DATA.map((_, index) => (
                <button
                  key={index}
                  className={`testimonios-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToTestimonio(index)}
                  aria-label={`Ir al testimonio ${index + 1}`}
                />
              ))}
            </div>

            <button 
              className="testimonios-btn next"
              onClick={nextTestimonio}
              aria-label="Siguiente testimonio"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="testimonios-auto">
            <button 
              className={`auto-btn ${isAutoPlaying ? 'playing' : 'paused'}`}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              aria-label={isAutoPlaying ? "Pausar testimonios" : "Reproducir testimonios"}
            >
              {isAutoPlaying ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                  <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


