import React from "react";
import { MARQUEE_ITEMS } from "../lib/data";

export default function Marquee() {
  const loop = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee" data-testid="marquee">
      <div className="marquee-track">
        {loop.map((it, i) => (
          <span key={i} className="marquee-item">
            {it}
            <span className="marquee-sep">&nbsp;✦&nbsp;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
