import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://scars.com.pe";
const DEFAULT_IMAGE = `${SITE_URL}/ScarsLogo.png`;
const BUSINESS_NAME = "SCARS Taller Mecanico E.I.R.L.";
const BUSINESS_PHONE = "+51 956 264 937";
const BUSINESS_EMAIL = "hola.scars@gmail.com";
const BUSINESS_ADDRESS = "AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22, Piura, Peru";
const BUSINESS_MAP =
  "https://www.google.com/maps/place/SCARS+TALLER+MECANICO+E.I.R.L";

const SEO_CONFIG = {
  home: {
    title: "Taller Mecanico en Piura | SCARS Taller Mecanico E.I.R.L.",
    description:
      "SCARS es un taller mecanico en Piura especializado en diagnostico, mantenimiento preventivo, reparacion general, alineacion, balanceo y cambio de aceite.",
    keywords:
      "taller mecanico en Piura, taller automotriz Piura, reparacion de autos Piura, mantenimiento preventivo, alineacion y balanceo, cambio de aceite, SCARS",
    image: DEFAULT_IMAGE,
    type: "website",
  },
  trazabilidad: {
    title: "Seguimiento de Servicios | SCARS Taller Mecanico Piura",
    description:
      "Consulta el estado de tu vehiculo en SCARS. Ingresa tu codigo de seguimiento y revisa el avance de tu servicio automotriz en Piura.",
    keywords:
      "seguimiento de servicios, seguimiento taller mecanico, estado de vehiculo, codigo de seguimiento, SCARS Piura",
    image: DEFAULT_IMAGE,
    type: "website",
  },
  contacto: {
    title: "Contacto y Cotizaciones | SCARS Taller Mecanico Piura",
    description:
      "Solicita informacion, cotizaciones o agenda tu servicio con SCARS Taller Mecanico en Piura. Atencion por telefono, WhatsApp y formulario web.",
    keywords:
      "contacto taller mecanico Piura, cotizacion automotriz Piura, WhatsApp SCARS, direccion taller SCARS",
    image: DEFAULT_IMAGE,
    type: "website",
  },
};

export function useSEO(page = "home", customMeta = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const config = SEO_CONFIG[page] || SEO_CONFIG.home;
    const meta = { ...config, ...customMeta };
    const pageUrl = `${SITE_URL}${pathname}`;

    document.title = meta.title;

    updateMetaTag("title", meta.title);
    updateMetaTag("description", meta.description);
    updateMetaTag("keywords", meta.keywords);
    updateMetaTag("robots", "index, follow, max-image-preview:large");

    updateMetaTag("og:title", meta.title, "property");
    updateMetaTag("og:description", meta.description, "property");
    updateMetaTag("og:image", meta.image, "property");
    updateMetaTag("og:image:alt", "Logo oficial de SCARS Taller Mecanico", "property");
    updateMetaTag("og:url", pageUrl, "property");
    updateMetaTag("og:type", meta.type || "website", "property");
    updateMetaTag("og:site_name", BUSINESS_NAME, "property");
    updateMetaTag("og:locale", "es_PE", "property");

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", meta.title);
    updateMetaTag("twitter:description", meta.description);
    updateMetaTag("twitter:image", meta.image);
    updateMetaTag("twitter:image:alt", "Logo oficial de SCARS Taller Mecanico");

    updateCanonical(pageUrl);
    updateStructuredData(meta, pathname, pageUrl);
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

function updateStructuredData(meta, pathname, pageUrl) {
  const existingScript = document.querySelector('script[type="application/ld+json"][data-seo]');
  if (existingScript) {
    existingScript.remove();
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS_NAME,
    alternateName: "SCARS Taller Mecanico",
    description:
      "Taller mecanico en Piura especializado en diagnostico, mantenimiento preventivo y reparacion automotriz.",
    url: SITE_URL,
    logo: DEFAULT_IMAGE,
    image: meta.image,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "AA.HH. San Pedro, Calle de la Paz, Mz. 2, Lote 22",
      addressLocality: "Piura",
      addressRegion: "Piura",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -5.199761152428329,
      longitude: -80.64571362414243,
    },
    areaServed: {
      "@type": "City",
      name: "Piura",
    },
    hasMap: BUSINESS_MAP,
    sameAs: [
      "https://www.facebook.com/scarstallermecanico",
      "https://www.instagram.com/scars_taller_mecanico/",
      "https://wa.me/51956264937",
    ],
    priceRange: "$$",
    serviceType: [
      "Diagnostico automotriz",
      "Mantenimiento preventivo",
      "Reparacion general",
      "Alineacion y balanceo",
      "Cambio de aceite y filtros",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BUSINESS_NAME,
    url: SITE_URL,
    inLanguage: "es-PE",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/trazabilidad?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: meta.title,
    description: meta.description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: meta.image,
    },
    inLanguage: "es-PE",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      ...(pathname !== "/"
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: getPageName(pathname),
              item: pageUrl,
            },
          ]
        : []),
    ],
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-seo", "true");
  script.textContent = JSON.stringify([
    organizationSchema,
    websiteSchema,
    webpageSchema,
    breadcrumbSchema,
  ]);
  document.head.appendChild(script);
}

function getPageName(pathname) {
  const names = {
    "/trazabilidad": "Seguimiento de Servicios",
    "/contacto": "Contacto",
  };
  return names[pathname] || "Inicio";
}
