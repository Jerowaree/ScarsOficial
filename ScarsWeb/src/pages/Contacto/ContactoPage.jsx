import { useEffect, useRef } from "react";
import { useForm, ValidationError } from '@formspree/react';
import "./ContactoPage.css";
import { useSEO } from "../../hooks/useSEO";

// Importar logos de marcas de autos
import chevrolet from "../../assets/galeria/chevrolet.png";
import ford from "../../assets/galeria/ford.png";
import jeep from "../../assets/galeria/jeep.svg";
import nissan from "../../assets/galeria/nissan.jpg";
import suzuki from "../../assets/galeria/suzuki.png";
import toyota from "../../assets/galeria/toyota.svg";

export default function ContactoPage() {
  useSEO("contacto");

  const [state, handleSubmit] = useForm("xykwdwyz");

  // Carrusel infinito verdadero con animación CSS
  const carruselRef = useRef(null);

  const images = [
    chevrolet,
    ford,
    jeep,
    nissan,
    suzuki,
    toyota
  ];

  // Duplicar imágenes para efecto infinito
  const infiniteImages = [...images, ...images];

  useEffect(() => {
    // Aplicar animación CSS infinita
    if (carruselRef.current) {
      carruselRef.current.style.animation = 'infiniteScroll 18s linear infinite';
    }
  }, []);

  if (state.succeeded) {
    return (
      <div className="ct-success-view" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy)',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>¡Gracias!</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px' }}>
          Hemos recibido tu solicitud. Nuestro equipo se pondrá en contacto contigo lo antes posible para atender tu consulta sobre tu vehículo.
        </p>
        <button
          className="ct-btn"
          style={{ marginTop: '30px' }}
          onClick={() => window.location.reload()}
        >
          VOLVER AL FORMULARIO
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="ct-page-hero">
        <div className="ct-hero-content">
          <div className="ct-title-section">
            <h2>
              <span>SOLICITA</span>
              <span>INFORMACIÓN</span>
            </h2>
            <div className="ct-contact-circles ct-contact-circles-compact">
              <div className="ct-contact-item">
                <div className="ct-circle">
                  <span className="ct-icon">☎</span>
                </div>
                <div className="ct-contact-info">
                  <span className="ct-label">Teléfono:</span>
                  <span className="ct-value">956 264 937</span>
                </div>
              </div>
              <div className="ct-contact-item">
                <div className="ct-circle">
                  <span className="ct-icon">🗺️</span>
                </div>
                <div className="ct-contact-info">
                  <span className="ct-label">Ubicación:</span>
                  <span className="ct-value">AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22, Piura</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-page-carrusel">
        <div className="ct-carrusel-container">
          <div className="ct-carrusel-track" ref={carruselRef}>
            {infiniteImages.map((image, index) => (
              <div key={index} className="ct-carrusel-slide">
                <img src={image} alt={`Logo de marca de auto`} className="ct-carrusel-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ct-page">
        <div className="container">
          <h1 className="ct-title">
            <span>NOS ENCANTARÍA AYUDARTE,</span>
            <span>RESERVA AQUÍ</span>
          </h1>
          <form className="ct-form" id="contacto-form" onSubmit={handleSubmit}>
            <div className="ct-grid">
              <label className="ct-field">
                <span>Nombre o Empresa *</span>
                <input name="nombre" required />
                <ValidationError prefix="Nombre" field="nombre" errors={state.errors} className="field-error" />
              </label>

              <label className="ct-field">
                <span>Modelo *</span>
                <input name="modelo" required />
                <ValidationError prefix="Modelo" field="modelo" errors={state.errors} className="field-error" />
              </label>

              <label className="ct-field">
                <span>Año *</span>
                <input name="anio" inputMode="numeric" pattern="\d{4}" required />
                <ValidationError prefix="Año" field="anio" errors={state.errors} className="field-error" />
              </label>

              <label className="ct-field">
                <span>Correo *</span>
                <input type="email" name="correo" required />
                <ValidationError prefix="Correo" field="correo" errors={state.errors} className="field-error" />
              </label>

              <label className="ct-field">
                <span>Teléfono *</span>
                <input type="tel" name="telefono" required />
                <ValidationError prefix="Teléfono" field="telefono" errors={state.errors} className="field-error" />
              </label>
            </div>

            <label className="ct-field ct-area">
              <span>Describe tu consulta o problema *</span>
              <textarea name="mensaje" rows={4} required />
              <ValidationError prefix="Mensaje" field="mensaje" errors={state.errors} className="field-error" />
            </label>

            <div className="ct-actions">
              <button type="submit" className="ct-btn" disabled={state.submitting}>
                {state.submitting ? "ENVIANDO..." : "ENVIAR"}
              </button>
            </div>
            {state.errors && state.errors.length > 0 && (
              <p className="field-error" style={{ marginTop: '10px' }}>
                Hubo un problema al enviar el formulario. Por favor verifica los datos.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Mapa de Ubicación */}
      <section className="ct-map-section">
        <div className="container">
          <h2 className="ct-map-title">Encuéntranos</h2>
          <div className="ct-map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.399325932214!2d-80.64571362414243!3d-5.199761152428329!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x904a1b55193f0e87%3A0x2670ca185a554315!2sSCARS%20TALLER%20MEC%C3%81NICO%20E.I.R.L!5e0!3m2!1ses-419!2spe!4v1761345533126!5m2!1ses-419!2spe"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de SCARS Taller Mecánico"
            />
          </div>
          <div className="ct-map-info">
            <p><strong>Dirección:</strong> AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22, Piura</p>
            <p><strong>Referencia:</strong> Cerca del mercado central, a 2 cuadras de la plaza principal</p>
          </div>
        </div>
      </section>
    </>
  );
}
