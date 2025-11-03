import { useState, useEffect, useRef } from "react";
import "./ContactoPage.css";
import { enviarSolicitudContacto } from "../../features/contacto/api";


// Importar logos de marcas de autos
import chevrolet from "../../assets/galeria/chevrolet.png";
import ford from "../../assets/galeria/ford.png";
import jeep from "../../assets/galeria/jeep.svg";
import nissan from "../../assets/galeria/nissan.jpg";
import suzuki from "../../assets/galeria/suzuki.png";
import toyota from "../../assets/galeria/toyota.svg";

export default function ContactoPage(){
  const [form, setForm] = useState({
    nombre: "", modelo: "", anio: "", correo: "", telefono: "", mensaje: ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const req = ["nombre","modelo","anio","correo","telefono","mensaje"];
    for (const k of req) {
      if (!String(form[k]).trim()) {
        showToast("Por favor, completa todos los campos marcados con *", 'error');
        return;
      }
    }
    setLoading(true);
    try {
      const datosParaEnviar = {
        ...form,
        tipo: 'Contacto General' // Clasificamos la solicitud
      };
      await enviarSolicitudContacto(datosParaEnviar);
      showToast("¡Gracias! Hemos recibido tu solicitud. Nos pondremos en contacto contigo pronto.", 'success');
      setForm({ nombre:"", modelo:"", anio:"", correo:"", telefono:"", mensaje:"" });
    } catch (error) {
      console.error("Error al enviar la solicitud de contacto:", error);
      const errorMsg = error?.response?.data?.error || error?.message || "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo más tarde.";
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`ct-toast ct-toast-${toast.type}`}>
          <div className="ct-toast-content">
            <div className="ct-toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </div>
            <div className="ct-toast-message">{toast.message}</div>
          </div>
          <button className="ct-toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

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
                <span className="ct-value">913908280</span>
              </div>
            </div>
            <div className="ct-contact-item">
              <div className="ct-circle">
                <span className="ct-icon">🗺️</span>
              </div>
              <div className="ct-contact-info">
                <span className="ct-label">Ubicación:</span>
                <span className="ct-value">AA.HH. San Pedro, Calle de la Paz, Mz. 2</span>
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
            <div 
              key={index} 
              className="ct-carrusel-slide"
            >
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
        <form className="ct-form" id="contacto-form" onSubmit={onSubmit} noValidate>
          {/* grid adaptable: 1 / 2 / 3 columnas */}
          <div className="ct-grid">
            <label className="ct-field">
              <span>Nombre o Empresa *</span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                required
                disabled={loading}
              />
            </label>

            <label className="ct-field">
              <span>Modelo *</span>
              <input
                name="modelo"
                value={form.modelo}
                onChange={onChange}
                required
                disabled={loading}
              />
            </label>

            <label className="ct-field">
              <span>Año *</span>
              <input
                name="anio"
                inputMode="numeric"
                pattern="\d{4}"
                value={form.anio}
                onChange={onChange}
                required
                disabled={loading}
              />
            </label>

            <label className="ct-field">
              <span>Correo *</span>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={onChange}
                required
                disabled={loading}
              />
            </label>

            <label className="ct-field">
              <span>Teléfono *</span>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={onChange}
                required
                disabled={loading}
              />
            </label>
          </div>

          <label className="ct-field ct-area">
            <span>Describe tu consulta o problema *</span>
            <textarea
              name="mensaje"
              rows={4}
              value={form.mensaje}
              onChange={onChange}
              required
              disabled={loading}
            />
          </label>

          <div className="ct-actions">
            <button type="submit" className="ct-btn" disabled={loading}>
              {loading ? "ENVIANDO..." : "ENVIAR"}
            </button>
          </div>
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
