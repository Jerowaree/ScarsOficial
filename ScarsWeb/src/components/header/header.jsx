import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./header.css";
import logo from "../../assets/logo_scars.png";

const HOME_SECTIONS = ["inicio", "servicios", "nosotros", "cita", "contacto"];

export default function Header() {
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const [active, setActive] = useState("inicio");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 920);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = [
    { id: "inicio", label: "INICIO", type: "anchor" },
    { id: "nosotros", label: "NOSOTROS", type: "anchor" },
    { id: "servicios", label: "SERVICIOS", type: "anchor" },
    { id: "trazabilidad", label: "SEGUIMIENTO", type: "route", to: "/trazabilidad" },
  ];

  const go = (item) => {
    if (item.type === "route") {
      navigate(item.to);
      setIsMobileMenuOpen(false);
      return;
    }

    if (pathname === "/") {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState({}, "", `#${item.id}`);
      }
      setIsMobileMenuOpen(false);
      return;
    }

    navigate({ pathname: "/", hash: `#${item.id}` });
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (pathname === "/trazabilidad") { setActive("trazabilidad"); return; }
    if (pathname === "/contacto") { setActive("contacto"); return; }
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
            <img src={logo} alt="SCARS - Taller Mecánico Especializado en Pintura Automotriz" width="120" height="42" />
          </div>

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

      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
