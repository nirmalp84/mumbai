import React from "react";
import HeroSlideshow from "../components/HeroSlideshow";
import Marquee from "../components/Marquee";
import StatsStrip from "../components/StatsStrip";
import CategoryGrid from "../components/CategoryGrid";
import WhyChooseUs from "../components/WhyChooseUs";
import ProductCard from "../components/ProductCard";
import { HowToOrder, CustomerTypes, FinalCTA } from "../components/Sections";
import SEO from "../components/SEO";
import { PRODUCTS } from "../lib/data";

export default function Home() {
  const featured = PRODUCTS.slice(0, 8);
  return (
    <div data-testid="page-home">
      <SEO
        path="/"
        title={null}
        description="Wholesale supplier of fancy latkans, laces, kalire, tassels, patches & festive decoratives in Bhuleshwar, Mumbai. 500+ designs, factory rates, Pan-India & worldwide shipping."
      />
      <HeroSlideshow />
      <Marquee />
      <StatsStrip />
      <CategoryGrid />

      <section className="section" data-testid="featured-section">
        <div className="container">
          <div className="header-center">
            <span className="label-accent">TOP PICKS</span>
            <h2 className="section-title">Featured Wholesale Products</h2>
            <div className="gold-divider" />
            <p className="section-sub">
              A glimpse of our most-loved designs — full catalog of 500+ available on WhatsApp.
            </p>
          </div>
          <div className="prod-grid">
            {featured.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <HowToOrder />
      <CustomerTypes />
      <FinalCTA />
    </div>
  );
}
