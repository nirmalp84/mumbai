import React from "react";
import { Link } from "react-router-dom";
import { Instagram, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { PHONE_PRIMARY, PHONE_ALT, waLink } from "../lib/data";

export default function Footer() {
  return (
    <footer className="footer" data-testid="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-top" style={{ color: "white" }}>Dream's</span>
            <span className="logo-line" />
            <span className="logo-bottom">Latkans &amp; Laces</span>
          </div>
          <p className="footer-tag">
            Mumbai's finest wholesale latkan &amp; lace supplier since years.
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" className="footer-soc" aria-label="Instagram" data-testid="footer-instagram"><Instagram size={16} /></a>
            <a href={waLink("Hello, I am interested in wholesale enquiry.")} target="_blank" rel="noreferrer" className="footer-soc" aria-label="WhatsApp" data-testid="footer-whatsapp"><MessageCircle size={16} /></a>
          </div>
        </div>

        <div>
          <h4>Categories</h4>
          <ul className="footer-list">
            <li><Link to="/products" data-testid="footer-cat-latkans">Fancy Latkans</Link></li>
            <li><Link to="/products" data-testid="footer-cat-laces">Laces &amp; Borders</Link></li>
            <li><Link to="/products" data-testid="footer-cat-kalire">Kalire &amp; Tassels</Link></li>
            <li><Link to="/products" data-testid="footer-cat-patches">Patches &amp; Buttons</Link></li>
            <li><Link to="/products" data-testid="footer-cat-festive">Festive Items</Link></li>
          </ul>
        </div>

        <div>
          <h4>Navigate</h4>
          <ul className="footer-list">
            <li><Link to="/" data-testid="footer-nav-home">Home</Link></li>
            <li><Link to="/products" data-testid="footer-nav-products">Products</Link></li>
            <li><Link to="/about" data-testid="footer-nav-about">About Us</Link></li>
            <li><Link to="/contact" data-testid="footer-nav-contact">Contact Us</Link></li>
            <li><a href={waLink("Hello, I am interested in wholesale enquiry.")} target="_blank" rel="noreferrer" data-testid="footer-nav-wa">WhatsApp Enquiry</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Get In Touch</h4>
          <div className="icon-row"><MapPin size={16} /><span>49/57, 1st Floor, 3rd Bhoiwada,<br/>Bhuleshwar, Mumbai – 400 002</span></div>
          <div className="icon-row"><Phone size={16} /><a href={`tel:+91${PHONE_PRIMARY.replace(/\s/g,'')}`} style={{color: 'inherit'}}>{PHONE_PRIMARY}</a></div>
          <div className="icon-row"><Phone size={16} /><a href={`tel:+91${PHONE_ALT.replace(/\s/g,'')}`} style={{color: 'inherit'}}>{PHONE_ALT}</a></div>
          <div className="icon-row"><MessageCircle size={16} /><a href={waLink("Hello, I am interested in wholesale enquiry.")} target="_blank" rel="noreferrer" className="footer-wa">WhatsApp Us</a></div>
          <div className="icon-row"><Clock size={16} /><span>Mon–Sat: 10 AM – 7 PM IST</span></div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 Dream's Latkans &amp; Laces, Mumbai. All Rights Reserved.
      </div>
    </footer>
  );
}
