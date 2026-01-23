import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://scars.com.pe";
const DEFAULT_IMAGE = `${SITE_URL}/logo_scars.png`;

const SEO_CONFIG = {
  home: {
    title: "SCARS | Taller Mecánico Especializado en Sector Automotriz | Piura",
    description: "SCARS es un taller mecánico especializado en sector automotriz, reparación y mantenimiento de vehículos en Piura. Servicios profesionales con años de experiencia.",
    keywords: "taller mecánico, sector automotriz, reparación de autos, mantenimiento vehicular, Piura, SCARS, taller automotriz",
    image: DEFAULT_IMAGE,
    type: "website",
  },
  trazabilidad: {
    title: "Seguimiento de Servicios | SCARS Taller Mecánico",
    description: "Consulta el estado de tu servicio en SCARS. Ingresa tu código de seguimiento y mantente informado del progreso de tu vehículo.",
    keywords: "seguimiento de servicio, estado de reparación, código de seguimiento, SCARS",
    image: DEFAULT_IMAGE,
    type: "website",
  },
  contacto: {
    title: "Contacto | SCARS Taller Mecánico - Piura",
    description: "Contáctanos en SCARS. Estamos ubicados en Piura. Solicita tu presupuesto para servicios de sector automotriz, reparación y mantenimiento.",
    keywords: "contacto SCARS, taller mecánico Piura, presupuesto, dirección, teléfono",
    image: DEFAULT_IMAGE,
    type: "website",
  },
};

export function useSEO(page = "home", customMeta = {}) {
  const { pathname } = useLocation();
  useEffect(() => {
    const config = SEO_CONFIG[page] || SEO_CONFIG.home;
    const meta = { ...config, ...customMeta };

    // Actualizar título
    document.title = meta.title;

    // Meta description
    updateMetaTag("description", meta.description);
    updateMetaTag("keywords", meta.keywords);

    // Open Graph
    updateMetaTag("og:title", meta.title, "property");
    updateMetaTag("og:description", meta.description, "property");
    updateMetaTag("og:image", meta.image, "property");
    updateMetaTag("og:url", `${SITE_URL}${pathname}`, "property");
    updateMetaTag("og:type", meta.type || "website", "property");
    updateMetaTag("og:site_name", "SCARS - Taller Mecánico", "property");
    updateMetaTag("og:locale", "es_PE", "property");

    // Twitter Card
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", meta.title);
    updateMetaTag("twitter:description", meta.description);
    updateMetaTag("twitter:image", meta.image);

    // Canonical URL
    updateCanonical(`${SITE_URL}${pathname}`);

    // Structured Data (JSON-LD)
    updateStructuredData(meta, pathname);
  }, [pathname, page, customMeta]);
}

function updateMetaTag(name, content, attribute = "name") {
  if (!content) return;

  let tag = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function updateCanonical(url) {
  let link = document.querySelector("link[rel='canonical']");

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

function updateStructuredData(meta, pathname) {
  // Eliminar structured data anterior
  const existingScript = document.querySelector('script[type="application/ld+json"][data-seo]');
  if (existingScript) {
    existingScript.remove();
  }

  // Datos estructurados principales
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "SCARS",
    "alternateName": "SCARS Taller Mecánico",
    "description": "Taller mecánico especializado en sector automotriz, reparación y mantenimiento de vehículos",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo_scars.png`,
    "image": meta.image,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Piura",
      "addressRegion": "Piura",
      "addressCountry": "PE"
    },
    "areaServed": {
      "@type": "City",
      "name": "Piura"
    },
    "serviceType": [
      "Sector Automotriz",
      "Reparación de Vehículos",
      "Mantenimiento Automotriz"
    ],
    "priceRange": "$$"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SCARS - Taller Mecánico",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/trazabilidad?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": SITE_URL
      },
      ...(pathname !== "/" ? [{
        "@type": "ListItem",
        "position": 2,
        "name": getPageName(pathname),
        "item": `${SITE_URL}${pathname}`
      }] : [])
    ]
  };

  // Crear script para structured data
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo", "true");
  script.textContent = JSON.stringify([organizationSchema, websiteSchema, breadcrumbSchema]);
  document.head.appendChild(script);
}

function getPageName(pathname) {
  const names = {
    "/trazabilidad": "Seguimiento",
    "/contacto": "Contacto"
  };
  return names[pathname] || "Inicio";
}

