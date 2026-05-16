import React, { useState } from "react";
import PageHero from "../components/PageHero";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { PRODUCTS, FILTERS, waLink } from "../lib/data";

export default function Products() {
  const [filter, setFilter] = useState("all");
  const [fading, setFading] = useState(false);

  const items = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  const switchFilter = (id) => {
    if (id === filter) return;
    setFading(true);
    setTimeout(() => {
      setFilter(id);
      setFading(false);
    }, 180);
  };

  return (
    <div data-testid="page-products">
      <SEO
        path="/products"
        title="Wholesale Products"
        description="Browse our wholesale collection — fancy latkans, saree borders, bridal kalire, tassels, patches, festive decoratives. 500+ designs, factory rates, bulk shipping."
        image="/images/cat-1.png"
      />
      <PageHero
        label="OUR COLLECTION"
        title="Wholesale Products"
        subtitle="Explore 500+ designs across latkans, laces, kalire and more. Wholesale orders only."
      />

      <div className="filter-bar" data-testid="filter-bar">
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`filter-tab ${filter === f.id ? "active" : ""}`}
              onClick={() => switchFilter(f.id)}
              data-testid={`filter-${f.id}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div
            className="prod-grid"
            style={{ opacity: fading ? 0 : 1, transition: "opacity .2s ease" }}
            data-testid="products-grid"
          >
            {items.map(p => <ProductCard key={p.id} p={p} />)}
          </div>

          <div className="catalog-cta" data-testid="catalog-cta">
            <p>Can't find what you need? We have 500+ designs in our catalog.</p>
            <a
              className="btn btn-gold"
              href={waLink("Hello, please share your full wholesale catalog.")}
              target="_blank" rel="noreferrer"
              data-testid="catalog-cta-btn"
            >
              WhatsApp for Full Catalog
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
