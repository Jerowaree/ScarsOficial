// Home.jsx (o el Home que declaraste dentro de App)
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Home(){
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [hash]);

  return (
    <>
      <section id="inicio" className="section-full"><Hero /></section>
      <section id="nosotros" className="section-full"><Nosotros /></section>
      <section id="servicios" className="section-full"><Servicios /></section>
    </>
  );
}
