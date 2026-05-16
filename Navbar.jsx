import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Phone, Menu, X } from "lucide-react";
import { PHONE_PRIMARY, waLink } from "../lib/data";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`} data-testid="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo" onClick={close} data-testid="nav-logo">
          <span className="logo-top">Dream's</span>
          <span className="logo-line" />
          <span className="logo-bottom">Latkans &amp; Laces</span>
        </Link>

        <nav className="nav-links" data-testid="nav-links">
          <NavLink to="/" end className={({isActive}) => `nav-link ${isActive?"active":""}`} data-testid="nav-link-home">Home</NavLink>
          <NavLink to="/products" className={({isActive}) => `nav-link ${isActive?"active":""}`} data-testid="nav-link-products">Products</NavLink>
          <NavLink to="/about" className={({isActive}) => `nav-link ${isActive?"active":""}`} data-testid="nav-link-about">About</NavLink>
          <NavLink to="/contact" className={({isActive}) => `nav-link ${isActive?"active":""}`} data-testid="nav-link-contact">Contact</NavLink>
        </nav>

        <div className="nav-right">
          <span className="nav-phone">
            <Phone size={14} /> {PHONE_PRIMARY}
          </span>
          <a
            href={waLink("Hello, I am interested in wholesale enquiry.")}
            target="_blank" rel="noreferrer"
            className="btn btn-wa btn-wa-nav"
            data-testid="nav-whatsapp-btn"
          >
            WhatsApp Enquiry
          </a>
          <button className="hamburger" onClick={() => setOpen(v=>!v)} aria-label="Toggle menu" data-testid="mobile-menu-toggle">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${open ? "open" : ""}`} data-testid="mobile-menu">
        <NavLink to="/" end onClick={close} data-testid="mobile-nav-home">Home</NavLink>
        <NavLink to="/products" onClick={close} data-testid="mobile-nav-products">Products</NavLink>
        <NavLink to="/about" onClick={close} data-testid="mobile-nav-about">About</NavLink>
        <NavLink to="/contact" onClick={close} data-testid="mobile-nav-contact">Contact</NavLink>
      </div>
    </header>
  );
}
