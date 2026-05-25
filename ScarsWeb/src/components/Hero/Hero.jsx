import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import heroPhoto from "../../assets/señorscars.png";
import toyotaLogo from "../../assets/toyota.png";
import nissanLogo from "../../assets/nIssan.png";
import chevroletLogo from "../../assets/chevrolet.png";
import hyundaiLogo from "../../assets/hyundai.png";
import kiaLogo from "../../assets/kia.png";

const HIGHLIGHTS = [
  {
    title: "Diagn\u00f3stico Especializado",
    tone: "navy",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M7 16h10" />
        <path d="M8 8h8" />
        <path d="M6 19h12" />
        <path d="M4 19V8l2-3h12l2 3v11" />
        <circle cx="8" cy="19" r="1.5" />
        <circle cx="16" cy="19" r="1.5" />
      </svg>
    ),
  },
  {
    title: "Mantenimiento Preventivo",
    tone: "red",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m14.6 7.5 1.9-1.9a2.8 2.8 0 0 1 4 4l-1.9 1.9" />
        <path d="M13.4 8.7 5 17.1a2.8 2.8 0 0 0 4 4l8.4-8.4" />
        <path d="m8.1 5.6 2.3 2.3" />
        <path d="m4.6 9.1 2.3 2.3" />
        <path d="m13.2 14.4 2.3 2.3" />
      </svg>
    ),
  },
  {
    title: "Reparaciones Generales",
    tone: "red",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M4.2 7.2 7 10" />
        <path d="m17 14 2.8 2.8" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <path d="m4.2 16.8 2.8-2.8" />
        <path d="M17 10l2.8-2.8" />
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    ),
  },
  {
    title: "Alineaci\u00f3n y Balanceo",
    tone: "navy",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3.5v17" />
        <path d="M8.1 4.5 15.9 19.5" />
        <path d="M15.9 4.5 8.1 19.5" />
      </svg>
    ),
  },
  {
    title: "Cambio de Aceite y Filtros",
    tone: "red",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h4l2-3h2l2 3h4" />
        <path d="M3.5 9.5h17v6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
        <path d="M18 9.5V7.8a1.8 1.8 0 0 0-1.8-1.8h-1.7" />
        <path d="M18.5 11.5h2" />
      </svg>
    ),
  },
];

const BRANDS = [
  { name: "Toyota", logo: toyotaLogo },
  { name: "Nissan", logo: nissanLogo },
  { name: "Chevrolet", logo: chevroletLogo },
  { name: "Hyundai", logo: hyundaiLogo },
  { name: "Kia", logo: kiaLogo },
];

export default function Hero() {
  const navigate = useNavigate();

  const goContact = () => {
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

  const goServices = () => {
    const servicesSection = document.getElementById("servicios");
    if (!servicesSection) return;
    servicesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState({}, "", "#servicios");
  };

  return (
    <section id="inicio" className="hero" aria-label="Taller mec\u00e1nico SCARS en Piura">
      <div className="hero__glow hero__glow--left" aria-hidden="true" />
      <div className="hero__glow hero__glow--right" aria-hidden="true" />

      <div className="hero__copyWrap">
        <div className="hero__copy">
          <div className="hero__badge">
            <span className="hero__badgeIcon" aria-hidden="true">
              <Wrench strokeWidth={2.2} />
            </span>
            <span>{"TALLER MEC\u00c1NICO EN PIURA"}</span>
          </div>

          <h1 className="hero__title">
            <span>{"TALLER MEC\u00c1NICO EN PIURA:"}</span>
            <span>{"CUIDADO PROFESIONAL Y"}</span>
            <span>{"SERVICIO DE CONFIANZA"}</span>
            <span className="hero__titleAccent">{"PARA TU AUTO."}</span>
          </h1>

          <p className="hero__description">
            {"Diagn\u00f3stico preciso, repuestos de calidad y t\u00e9cnicos especializados "}
            {"para que tu veh\u00edculo siempre est\u00e9 en las mejores manos."}
          </p>

          <div className="hero__highlights" role="list" aria-label="Servicios destacados">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="hero__highlight" role="listitem">
                <span className={`hero__highlightIcon hero__highlightIcon--${item.tone}`}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>

          <div className="hero__actions">
            <button
              className="hero__cta hero__cta--primary"
              onClick={goContact}
              aria-label="Ir al formulario de contacto"
            >
              <span>Cotizar ahora</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </button>

            <button
              className="hero__cta hero__cta--secondary"
              onClick={goServices}
              aria-label="Ir a la secci\u00f3n de servicios"
            >
              <span>Conoce nuestros servicios</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="m5 13 7 7 7-7" />
              </svg>
            </button>
          </div>

          <div className="hero__brands">
            <div className="hero__brandsHeader">
              <span>CONFIAN EN NOSOTROS</span>
              <span className="hero__brandsLine" aria-hidden="true" />
            </div>

            <div className="hero__brandList">
              {BRANDS.map((brand) => (
                <div key={brand.name} className="hero__brand">
                  <img src={brand.logo} alt={brand.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hero__media" aria-hidden="true">
        <img className="hero__mediaImage" src={heroPhoto} alt="" />
      </div>
    </section>
  );
}
