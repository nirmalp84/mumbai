import React from "react";

export default function PageHero({ label, title, subtitle }) {
  return (
    <section className="page-hero" data-testid="page-hero">
      <div className="container">
        <span className="label-accent">{label}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
