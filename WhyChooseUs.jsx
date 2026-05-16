import React from "react";
import { waLink, WHY_FEATURES } from "../lib/data";

export default function WhyChooseUs() {
  return (
    <section className="why" data-testid="why-section">
      <div className="container why-grid">
        <div>
          <span className="label-accent" style={{ color: "var(--gold)" }}>WHY US</span>
          <h2>{"Why Manufacturers\nChoose Us"}</h2>
          <div className="why-divider" />
          <p className="why-p">
            We have been Mumbai's trusted wholesale supplier of fancy latkans,
            laces and decorative accessories. We work directly with saree
            manufacturers, lehenga makers, and fashion traders — no middlemen,
            best prices, fast shipping.
          </p>
          <a
            className="btn btn-gold"
            href={waLink("Hello, please share the latest wholesale price list.")}
            target="_blank" rel="noreferrer"
            data-testid="why-pricelist-btn"
          >
            WhatsApp for Price List
          </a>
        </div>
        <div>
          {WHY_FEATURES.map((f) => (
            <div key={f.n} className="feature-row" data-testid={`feature-${f.n}`}>
              <span className="feature-num">{f.n}</span>
              <div>
                <div className="feature-title">{f.t}</div>
                <div className="feature-desc">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
