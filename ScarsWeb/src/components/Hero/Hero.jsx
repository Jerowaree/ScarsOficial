import "./Hero.css";
import heroImg from "../../assets/hero.jpg";
import { useNavigate } from "react-router-dom";
// ...existing code...

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


  return (
    <section id="inicio" className="hero section-full" style={{ backgroundImage: `url(${heroImg})` }} aria-label="Bienvenido a SCARS">
      <div className="hero__overlay" aria-hidden="true" />
      <div className="container hero__content">
        <h1 className="hero__title">
          TALLER MECÁNICO EN PIURA:<br />CUIDADO EXPERTO Y SERVICIO<br />INSUPERABLE PARA TU AUTO.<br />
          <span className="sub">¡DALE A TU VEHÍCULO EL TRATO QUE MERECE!</span>
        </h1>
        <button className="hero__cta" onClick={goContact} aria-label="Contactar a SCARS para servicios automotrices">CONTÁCTANOS</button>
      </div>
    </section>
  );
}
