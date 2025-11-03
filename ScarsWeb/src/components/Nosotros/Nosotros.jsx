import "./Nosotros.css";

// Importar imágenes
import nos1 from "../../assets/nos1.jpg";
import nos2 from "../../assets/nos2.jpg";
import nos3 from "../../assets/nos3.jpg";
import nos4 from "../../assets/nos4.jpg";

const IMGS = [nos1, nos2, nos3, nos4];

export default function Nosotros() {
  return (
    <section id="nosotros" className="section-full nosotros">
      <div className="container">
        <div className="nosotros__header">
          <h2 className="nosotros__title">
            <span>SOBRE</span>
            <span>NOSOTROS</span>
          </h2>
          <div className="nosotros__divider"></div>
        </div>

        <div className="nosotros__content">
          {/* LADO IZQUIERDO: Galería asimétrica innovadora */}
          <div className="nosotros__gallery">
            <div className="gallery__container">
              <div className="gallery__main">
                <div className="gallery__item gallery__item--large">
                  <img src={IMGS[0]} alt="Taller SCARS principal" />
                </div>
              </div>
              <div className="gallery__secondary">
                <div className="gallery__item gallery__item--medium">
                  <img src={IMGS[1]} alt="Taller SCARS secundario" />
                </div>
                <div className="gallery__item gallery__item--small">
                  <img src={IMGS[2]} alt="Taller SCARS detalle" />
                </div>
                <div className="gallery__item gallery__item--small">
                  <img src={IMGS[3]} alt="Taller SCARS trabajo" />
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Contenido */}
          <div className="nosotros__info">
            <div className="nosotros__story">
              <div className="story__section">
                <h3 className="story__title">Nuestra Historia</h3>
                <p className="story__text">
                  En SCARS Taller Mecánico, nuestra historia comenzó hace más de 30 años cuando José
                  Mercedes Ruiz Berru fundó un pequeño taller en Piura. Con esfuerzo y dedicación, 
                  ese pequeño taller se transformó en el negocio próspero que conocemos hoy.
                </p>
              </div>

              <div className="story__section">
                <h3 className="story__title">Nuestro Compromiso</h3>
                <p className="story__text">
                  Brindamos servicios de alta calidad y excelente atención. Nuestro compromiso con la
                  satisfacción del cliente nos ha permitido mantener una base de clientes creciente.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
