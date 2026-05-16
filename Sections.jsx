import React from "react";
import { HOW_STEPS, CUSTOMER_CHIPS, waLink, PHONE_PRIMARY } from "../lib/data";

export function HowToOrder() {
  return (
    <section className="section bg-offwhite" data-testid="how-section">
      <div className="container">
        <div className="header-center">
          <span className="label-accent">SIMPLE PROCESS</span>
          <h2 className="section-title">How to Order Wholesale</h2>
          <div className="gold-divider" />
        </div>
        <div className="how-grid">
          {HOW_STEPS.map((s) => (
            <div key={s.n} className="how-step" data-testid={`step-${s.n}`}>
              <div className="how-circle">{s.n}</div>
              <h3 className="how-title">{s.t}</h3>
              <p className="how-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CustomerTypes() {
  return (
    <section className="section" data-testid="customers-section">
      <div className="container">
        <div className="header-center">
          <span className="label-accent">OUR CLIENTS</span>
          <h2 className="section-title">Who We Supply To</h2>
          <div className="gold-divider" />
        </div>
        <div className="chip-row">
          {CUSTOMER_CHIPS.map((c, i) => (
            <span key={i} className="chip" data-testid={`chip-${i}`}>
              <span className="chip-icon">{c.icon}</span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="final-cta" data-testid="final-cta">
      <div className="container">
        <span className="label-accent">READY TO ORDER?</span>
        <h2>Start Your Wholesale Enquiry Today</h2>
        <div className="final-cta-actions">
          <a
            className="btn btn-gold"
            href={waLink("Hello, I want to start a wholesale enquiry.")}
            target="_blank" rel="noreferrer"
            data-testid="final-cta-whatsapp"
          >
            WhatsApp: {PHONE_PRIMARY}
          </a>
          <a
            className="btn btn-outline-white"
            href={`tel:+91${PHONE_PRIMARY.replace(/\s/g,'')}`}
            data-testid="final-cta-call"
          >
            Call Now
          </a>
        </div>
      </div>
    </section>
  );
}
