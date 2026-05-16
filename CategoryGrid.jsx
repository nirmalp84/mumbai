import React from "react";
import { Link } from "react-router-dom";
import GenImage from "./GenImage";
import { CATEGORIES } from "../lib/data";

export default function CategoryGrid() {
  return (
    <section className="section bg-offwhite" data-testid="category-section">
      <div className="container">
        <div className="header-center">
          <span className="label-accent">WHAT WE OFFER</span>
          <h2 className="section-title">Our Product Categories</h2>
          <div className="gold-divider" />
          <p className="section-sub">
            From bridal kalire to festive latkans — wholesale rates on every design.
          </p>
        </div>

        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <article key={c.id} className="cat-card" data-testid={`category-card-${c.id}`}>
              <div className="cat-img-wrap">
                <GenImage name={c.img} alt={c.name} />
              </div>
              <div className="cat-body">
                <h3 className="cat-name">{c.name}</h3>
                <ul className="cat-bullets">
                  {c.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <Link to="/products" className="cat-link" data-testid={`category-link-${c.id}`}>View Products →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
