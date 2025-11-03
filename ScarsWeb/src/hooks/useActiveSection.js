import { useEffect, useState } from "react";

export default function useActiveSection(ids){
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      // La que queda cerca del centro toma prioridad
      const mid = window.innerHeight * 0.45;
      let best = {id: ids[0], dist: Infinity};
      for (const e of entries) {
        const rect = e.target.getBoundingClientRect();
        const dist = Math.abs(rect.top - mid);
        if (dist < best.dist) best = { id: e.target.id, dist };
      }
      setActive(best.id);
    }, { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-35% 0px -50% 0px" });

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return active;
}
