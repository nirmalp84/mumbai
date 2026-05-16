import React from "react";
import GenImage from "./GenImage";
import { waLink, FILTERS } from "../lib/data";

const catLabel = (id) => {
  const m = FILTERS.find(f => f.id === id);
  return m ? m.label : id;
};

export default function ProductCard({ p }) {
  return (
    <article className="prod-card" data-testid={`product-card-${p.id}`}>
      <div className="prod-img-wrap">
        <GenImage name={p.img} alt={p.name} />
      </div>
      <div className="prod-body">
        <span className="prod-badge">{catLabel(p.cat)}</span>
        <h3 className="prod-name">{p.name}</h3>
        <p className="prod-desc">{p.desc}</p>
        <a
          className="prod-cta"
          href={waLink(`Hello, I am interested in wholesale enquiry for: ${p.name}. Please share the price list and minimum order quantity.`)}
          target="_blank" rel="noreferrer"
          data-testid={`product-enquire-${p.id}`}
        >
          Enquire on WhatsApp →
        </a>
      </div>
    </article>
  );
}
