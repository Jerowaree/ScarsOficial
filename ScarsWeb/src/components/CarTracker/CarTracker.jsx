import { useEffect, useMemo, useState } from "react";
import carPng from "../../assets/carrito.png"; // tu PNG

export default function CarTracker({
  sections = ["inicio", "servicios", "nosotros", "galeria", "contacto"],
  img = carPng,
  bottom = 20,
}) {
  const [active, setActive] = useState(sections[0]);

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.45;
      let bestId = sections[0];
      let bestDist = Number.POSITIVE_INFINITY;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        const dist = Math.abs(top - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      }
      setActive(bestId);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  const leftPct = useMemo(() => {
    const idx = Math.max(0, sections.indexOf(active));
    if (sections.length <= 1) return 0;
    return (idx / (sections.length - 1)) * 100;
  }, [active, sections]);

  return (
    <div className="car-track" style={{ bottom }}>
      <div className="car-track__line" />
      <img
        className="car-track__car"
        src={img}
        alt="car"
        style={{ left: `${leftPct}%` }}
        draggable={false}
      />
    </div>
  );
}
