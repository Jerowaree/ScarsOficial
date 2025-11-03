import "./Cita.css";
import bg from "../../assets/cita_bg.jpg"; // tu imagen de fondo
import { Link, useNavigate } from "react-router-dom";

export default function Cita(){
  const navigate = useNavigate();

  const goToForm = (e) => {
    e.preventDefault();
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
    <section id="cita" className="section-full cita">
      <div className="cita__bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="cita__overlay" />
      <div className="container cita__content">
        <div className="cita__header">
          <h2 className="cita__title">
            <span>¿LISTO PARA</span>
            <span>EMPEZAR?</span>
          </h2>
          <div className="cita__divider"></div>
        </div>
        
        <div className="cita__main">
          <p className="cita__lead">
            Si necesitas cualquier reparación o mantenimiento para tu automóvil,
            tu mecánico automotriz de confianza está aquí para ayudarte.
          </p>
          
          <div className="cita__cta">
            <a href="/contacto" onClick={goToForm} className="btn btn-primary cita__btn">
              <span>Agenda tu cita</span>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
