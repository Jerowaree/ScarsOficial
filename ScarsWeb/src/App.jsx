import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "./hooks/useSEO";

import Header from "./components/header/header.jsx";
import Footer from "./components/footer/Footer.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";

import Hero from "./components/Hero/Hero.jsx";
import Estadisticas from "./components/Estadisticas/Estadisticas.jsx";
import Servicios from "./components/Servicios/Servicios.jsx";
import Testimonios from "./components/Testimonios/Testimonios.jsx";
import Proceso from "./components/Proceso/Proceso.jsx";
import Nosotros from "./components/Nosotros/Nosotros.jsx";
import Cita from "./components/Cita/Cita.jsx";

import TrazabilidadPage from "./pages/Trazabilidad/TrazabilidadPage.jsx";
import ContactoPage from "./pages/Contacto/ContactoPage.jsx";
import AdminRoutes from "./admin/routes/AdminRoutes.jsx";

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}

function Home() {
  const { hash } = useLocation();
  useSEO("home");
  
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [hash]);

  return (
    <>
      <Hero />
      <Estadisticas />
      <Nosotros />
      <Servicios />
      <Testimonios />
      <Proceso />
      <Cita />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/trazabilidad" element={<TrazabilidadPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
