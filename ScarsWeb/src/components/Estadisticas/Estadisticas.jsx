import { useEffect, useState } from "react";
import "./Estadisticas.css";

const STATS_DATA = [
  {
    id: 1,
    number: "500",
    suffix: "+",
    label: "Vehículos Reparados",
    description: "Más de 500 vehículos restaurados a su mejor estado",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19 12H5L6.5 6.5ZM7 13.5C7.83 13.5 8.5 14.17 8.5 15S7.83 16.5 7 16.5 5.5 15.83 5.5 15 6.17 13.5 7 13.5ZM17 13.5C17.83 13.5 18.5 14.17 18.5 15S17.83 16.5 17 16.5 15.5 15.83 15.5 15 16.17 13.5 17 13.5Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 2,
    number: "30",
    suffix: "+",
    label: "Años de Experiencia",
    description: "30 años de experiencia en el sector automotriz",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2ZM12 6.24L11.5 8.74L9 9L11.5 9.26L12 11.76L12.5 9.26L15 9L12.5 8.74L12 6.24ZM8.5 14L9.5 17L12.5 15.5L9.5 18.5L8.5 21.5L7.5 18.5L4.5 15.5L7.5 17L8.5 14ZM15.5 14L16.5 17L19.5 15.5L16.5 18.5L15.5 21.5L14.5 18.5L11.5 15.5L14.5 17L15.5 14Z" fill="currentColor"/>
      </svg>
    )
  },
  {
    id: 3,
    number: "98",
    suffix: "%",
    label: "Satisfacción del Cliente",
    description: "Clientes satisfechos con nuestros servicios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35ZM16.5 5C14.76 5 13.09 5.81 12 7.08C10.91 5.81 9.24 5 7.5 5C5.42 5 4 6.41 4 8.5C4 11.27 7.4 14.36 12 18.86C16.6 14.36 20 11.27 20 8.5C20 6.41 18.58 5 16.5 5Z" fill="currentColor"/>
      </svg>
    )
  }
];

export default function Estadisticas() {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    1: 0, 2: 0, 3: 0
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById("estadisticas");
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const targets = {
      1: 500,
      2: 30,
      3: 98
    };

    const duration = 2000; // 2 segundos
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(targets).forEach(key => {
      const target = targets[key];
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));
      }, stepDuration);
    });
  };

  return (
    <section id="estadisticas" className="estadisticas section-full">
      <div className="container">
        <div className="estadisticas-header">
          <h2 className="estadisticas-title">
            <span>NUESTROS</span>
            <span>LOGROS</span>
          </h2>
          <p className="estadisticas-subtitle">
            Números que respaldan nuestra experiencia y compromiso con la excelencia
          </p>
        </div>

        <div className="estadisticas-grid">
          {STATS_DATA.map((stat) => (
            <div key={stat.id} className="estadistica-card">
              <div className="estadistica-icon">{stat.icon}</div>
              <div className="estadistica-number">
                <span className="estadistica-value">{counters[stat.id]}</span>
                <span className="estadistica-suffix">{stat.suffix}</span>
              </div>
              <h3 className="estadistica-label">{stat.label}</h3>
              <p className="estadistica-description">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
