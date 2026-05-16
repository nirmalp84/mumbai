import React from "react";
import PageHero from "../components/PageHero";
import GenImage from "../components/GenImage";
import StatsStrip from "../components/StatsStrip";
import SEO from "../components/SEO";
import { FinalCTA } from "../components/Sections";

export default function About() {
  return (
    <div data-testid="page-about">
      <SEO
        path="/about"
        title="About Us"
        description="Dream's Latkans & Laces — Bhuleshwar, Mumbai's trusted wholesale supplier of fancy latkans, laces & festive decoratives. Direct manufacturer contact, no middlemen."
        image="/images/about-1.png"
      />
      <PageHero
        label="ABOUT US"
        title="About Us"
        subtitle="Mumbai's Trusted Wholesale Supplier"
      />

      <section className="section">
        <div className="container">
          <div className="about-row">
            <div className="about-img-wrap" data-testid="about-image-1">
              <GenImage name="about-1" alt="Mumbai textile wholesale market" />
            </div>
            <div className="about-text">
              <span className="label-accent">OUR STORY</span>
              <h2>{"Crafting & Supplying Beauty\nSince Years"}</h2>
              <p>
                Dream's Latkans &amp; Laces is based in Bhuleshwar — the heart of
                Mumbai's textile and wholesale accessories market. We specialize in
                wholesale supply of fancy latkans, laces, borders, kalire, tassels,
                patches, and festive decoration items.
              </p>
              <p>
                We supply directly to saree manufacturers, lehenga makers, chudi
                wholesalers, fashion accessory shops, and festive decoration
                suppliers across India and worldwide. No retail. Wholesale only.
              </p>
              <ul className="about-bullets">
                <li>500+ latkan and lace designs in stock</li>
                <li>Stone work, resham, zari, and mirror work</li>
                <li>Bridal, festive, and everyday collections</li>
                <li>Pan-India shipping + worldwide export</li>
                <li>Direct manufacturer contact, no middlemen</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-offwhite">
        <div className="container">
          <div className="about-row reverse">
            <div className="about-text">
              <span className="label-accent">OUR CRAFT</span>
              <h2>{"Rooted in Bhuleshwar,\nLoved Worldwide"}</h2>
              <p>
                Working closely with skilled artisans across Mumbai and Gujarat, every
                latkan, lace and tassel we offer is the result of generations of
                craftsmanship. Our team curates the finest designs and brings them to
                your store at the most competitive wholesale prices.
              </p>
              <p>
                Whether you run a saree showroom in Surat, a lehenga studio in Delhi,
                or an export business shipping to Dubai and Toronto — we're your
                one-stop source for fancy decorative accessories.
              </p>
              <ul className="about-bullets">
                <li>Direct artisan partnerships in Mumbai &amp; Surat</li>
                <li>Strict quality check on every bulk order</li>
                <li>Custom designs for high-volume buyers</li>
                <li>Trusted by 1,000+ businesses across India</li>
              </ul>
            </div>
            <div className="about-img-wrap" data-testid="about-image-2">
              <GenImage name="about-2" alt="Artisan hands holding colorful latkans" />
            </div>
          </div>
        </div>
      </section>

      <StatsStrip />
      <FinalCTA />
    </div>
  );
}
