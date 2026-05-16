import React, { useEffect, useRef, useState } from "react";
import { STATS } from "../lib/data";

function CountUp({ target, suffix }) {
  const [val, setVal] = useState(0);
  const elRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const duration = 1600;
          const start = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - start) / duration);
            setVal(Math.floor(p * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    if (elRef.current) obs.observe(elRef.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={elRef}>{val}{suffix || ""}</span>;
}

export default function StatsStrip() {
  return (
    <section className="stats" data-testid="stats-section">
      <div className="container">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="stat" data-testid={`stat-${i}`}>
              <div className="stat-num">
                {s.num != null ? <CountUp target={s.num} suffix={s.suffix} /> : s.text}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
