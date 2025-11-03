import "./Hero.css";
import heroImg from "../../assets/hero.jpg";
import { useNavigate } from "react-router-dom";
// ...existing code...

export default function Hero(){
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
    <section id="inicio" className="hero section-full" style={{backgroundImage:`url(${heroImg})`}}>
      <div className="hero__overlay" />
      <div className="container hero__content">
        <h1 className="hero__title">
          CUIDADO DE EXPERTOS<br/>PARA TU AUTO, SERVICIO<br/>INSUPERABLE.<br/>
          <span className="sub">¡HAZ QUE TU VEHÍCULO FUNCIONE COMO NUEVO!</span>
        </h1>
        <button className="hero__cta" onClick={goContact}>CONTÁCTANOS</button>
      </div>
    </section>
  );
}
