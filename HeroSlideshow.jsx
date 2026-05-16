import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GenImage from "./GenImage";
import { HERO_SLIDES, waLink } from "../lib/data";

export default function HeroSlideshow() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIdx(i => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, idx]);

  const go = (n) => setIdx((n + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <div
      className="hero"
      data-testid="hero-slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <div key={s.key} className={`hero-slide ${i === idx ? "active" : ""}`} aria-hidden={i !== idx}>
          <GenImage name={s.key} alt={s.title.replace('\n',' ')} loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}

      <div className="hero-content" key={idx}>
        <div className="hero-content-inner">
          <div className="hero-pill" data-testid="hero-pill">{HERO_SLIDES[idx].pill}</div>
          <h1 className="hero-title" data-testid="hero-title">{HERO_SLIDES[idx].title}</h1>
          <p className="hero-sub">
            Supplying manufacturers &amp; traders across India and worldwide
          </p>
          <div className="hero-actions">
            <a href="/products" className="btn btn-gold" data-testid="hero-explore-btn">Explore Collection</a>
            <a
              href={waLink("Hello, I want to enquire about wholesale latkans & laces.")}
              target="_blank" rel="noreferrer"
              className="btn btn-outline-white" data-testid="hero-whatsapp-btn"
            >
              WhatsApp Enquiry
            </a>
          </div>
        </div>
      </div>

      <button className="hero-arrow prev" onClick={() => go(idx - 1)} aria-label="Previous slide" data-testid="hero-prev">
        <ChevronLeft size={36} />
      </button>
      <button className="hero-arrow next" onClick={() => go(idx + 1)} aria-label="Next slide" data-testid="hero-next">
        <ChevronRight size={36} />
      </button>

      <div className="hero-dots" data-testid="hero-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === idx ? "active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            data-testid={`hero-dot-${i}`}
          />
        ))}
      </div>

      <div className="hero-counter" data-testid="hero-counter">
        {String(idx + 1).padStart(2,'0')} / {String(HERO_SLIDES.length).padStart(2,'0')}
      </div>
    </div>
  );
}
