import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./header.css";
import logo from "../../assets/logo_scars.png";

const HOME_SECTIONS = ["inicio", "servicios", "nosotros", "cita", "contacto"];

export default function Header() {
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const [active, setActive] = useState("inicio");
  const [carLeft, setCarLeft] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 920);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Menú: anclas del home + rutas
  const links = [
    { id: "inicio", label: "INICIO", type: "anchor" },
    { id: "nosotros", label: "NOSOTROS", type: "anchor" },
    { id: "servicios", label: "SERVICIOS", type: "anchor" },
    { id: "trazabilidad", label: "SEGUIMIENTO", type: "route", to: "/trazabilidad " },
  ];

  // >>> AQUÍ el cambio importante: usar hash para anclas <<<
  const go = (item) => {
    if (item.type === "route") {
      navigate(item.to);
      setIsMobileMenuOpen(false); // Cerrar menú móvil
      return;
    }
    // Si estamos en Home, desplazamos y actualizamos hash
    if (pathname === "/") {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // actualizar hash sin recargar
        window.history.replaceState({}, "", `#${item.id}`);
      }
      setIsMobileMenuOpen(false); // Cerrar menú móvil
      return;
    }
    // Si NO estamos en Home, navegamos a /#id
    navigate({ pathname: "/", hash: `#${item.id}` });
    setIsMobileMenuOpen(false); // Cerrar menú móvil
  };

  // Función para alternar menú móvil
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth > 920;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileMenuOpen(false); // Cerrar menú móvil en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.nav') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Activo: si estamos en otras rutas, forzamos 'galeria' o 'contacto'
  useEffect(() => {
    if (pathname === "/trazabilidad") { setActive("trazabilidad"); return; }
    if (pathname === "/contacto") { setActive("contacto"); return; }

    // Home: elegir por cercanía bajo el header
    const updateActive = () => {
      const headerH = document.querySelector(".site-header")?.offsetHeight || 86;
      const refY = headerH + 6;
      let best = HOME_SECTIONS[0], bestDist = Infinity;
      for (const id of HOME_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        const d = Math.abs(top - refY);
        if (d < bestDist) { bestDist = d; best = id; }
      }
      setActive(best);
    };

    requestAnimationFrame(updateActive);
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [pathname]);

  // Colocar el carrito bajo el link activo (solo en desktop y en home)
  useEffect(() => {
    if (!isDesktop || pathname !== "/") {
      setCarLeft(0);
      return;
    }
    
    const nav = navRef.current;
    const el = linkRefs.current[active];
    if (!nav || !el) return;
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setCarLeft(r.left + r.width / 2 - navRect.left);
  }, [active, pathname, isDesktop]);

  return (
    <>
      <header className="site-header">
        <div className="container header-row">
          <div
            className="brand"
            onClick={() => navigate("/")}
            role="button"
            aria-label="SCARS inicio"
          >
            <img src={logo} alt="SCARS" />
          </div>

          {/* Botón hamburguesa para móvil */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`} ref={navRef}>
            {links.map((l) => (
              <button
                key={l.id}
                ref={(el) => (linkRefs.current[l.id] = el)}
                className={`nav-link ${active === l.id ? "active" : ""}`}
                onClick={() => go(l)}
              >
                {l.label}
              </button>
            ))}

            {/* CONTACTO como ruta */}
            <button
              ref={(el) => (linkRefs.current["contacto"] = el)}
              className={`nav-cta ${active === "contacto" ? "active" : ""}`}
              onClick={() => navigate("/contacto")}
            >
              CONTACTO
            </button>

            
            
          </nav>
        </div>
      </header>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
