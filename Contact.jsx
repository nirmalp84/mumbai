import React, { useState } from "react";
import axios from "axios";
import { MapPin, Phone, Clock, Globe2, CheckCircle2 } from "lucide-react";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import {
  PHONE_PRIMARY, PHONE_PRIMARY_RAW, PHONE_ALT, PHONE_ALT_RAW,
  waLink, FORM_CATEGORIES,
} from "../lib/data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const empty = {
  full_name: "", business_name: "", phone: "", email: "",
  city_state: "", category: "", quantity: "", message: "",
};

const required = ["full_name", "business_name", "phone", "category"];

export default function Contact() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onChange = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: null });
  };

  const validate = () => {
    const errs = {};
    required.forEach((k) => {
      if (!form[k] || !String(form[k]).trim()) errs[k] = "This field is required";
    });
    if (form.phone && form.phone.replace(/\D/g, "").length < 7) {
      errs.phone = "Enter a valid phone number";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email";
    }
    return errs;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/enquiry`, form);
      setSuccess(true);
    } catch (err) {
      setErrors({ _form: "Could not send enquiry. Please try WhatsApp instead." });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls = (k) => `field ${errors[k] ? "error" : ""}`;

  return (
    <div data-testid="page-contact">
      <SEO
        path="/contact"
        title="Contact Us"
        description="WhatsApp wholesale enquiries to Dream's Latkans & Laces in Bhuleshwar, Mumbai. Primary: 90043 56576 · Alternate: 98209 18646. Mon–Sat, 10 AM – 7 PM IST."
      />
      <PageHero
        label="GET IN TOUCH"
        title="Contact Us"
        subtitle="Wholesale enquiries only. We respond within 24 hours."
      />

      <section className="section">
        <div className="container contact-grid">
          {/* Left: Contact Details */}
          <div data-testid="contact-details">
            <h2 className="section-title" style={{ fontSize: 32, textAlign: "left" }}>Get In Touch</h2>
            <p style={{ color: "var(--gray)", marginBottom: 24 }}>
              Reach out by WhatsApp, phone, or the form — whichever works best for you.
              Bulk &amp; export enquiries are most welcome.
            </p>

            <div className="contact-block">
              <MapPin size={20} />
              <div>
                <div className="lbl">Address</div>
                <div className="val">49/57, 1st Floor, 3rd Bhoiwada,<br/>Bhuleshwar, Mumbai – 400 002</div>
              </div>
            </div>
            <div className="contact-block">
              <Phone size={20} />
              <div>
                <div className="lbl">Primary</div>
                <a href={`tel:+${PHONE_PRIMARY_RAW}`} className="val" data-testid="contact-phone-primary">{PHONE_PRIMARY}</a>
              </div>
            </div>
            <div className="contact-block">
              <Phone size={20} />
              <div>
                <div className="lbl">Alternate</div>
                <a href={`tel:+${PHONE_ALT_RAW}`} className="val" data-testid="contact-phone-alt">{PHONE_ALT}</a>
              </div>
            </div>
            <div className="contact-block">
              <Clock size={20} />
              <div>
                <div className="lbl">Hours</div>
                <div className="val">Monday to Saturday, 10 AM – 7 PM IST</div>
              </div>
            </div>
            <div className="contact-block">
              <Globe2 size={20} />
              <div>
                <div className="lbl">Shipping</div>
                <div className="val">India &amp; Worldwide</div>
              </div>
            </div>

            <div className="contact-wa-stack">
              <a
                className="btn btn-wa"
                href={waLink("Hello, I want to start a wholesale enquiry.")}
                target="_blank" rel="noreferrer"
                data-testid="contact-wa-primary"
              >
                WhatsApp: {PHONE_PRIMARY}
              </a>
              <a
                className="btn btn-wa-outline"
                href={`https://wa.me/${PHONE_ALT_RAW}?text=${encodeURIComponent("Hello, I want to start a wholesale enquiry.")}`}
                target="_blank" rel="noreferrer"
                data-testid="contact-wa-alt"
              >
                Alternate: {PHONE_ALT}
              </a>
            </div>

            <div className="contact-map" data-testid="contact-map">
              <iframe
                title="Dream's Latkans & Laces — Bhuleshwar, Mumbai"
                src="https://maps.google.com/maps?q=49%2057%20Bhoiwada%20Bhuleshwar%20Mumbai%20400002&t=&z=15&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="form-card" data-testid="enquiry-form-card">
            {success ? (
              <div className="form-success" data-testid="form-success">
                <div className="check"><CheckCircle2 size={36} /></div>
                <h3>Thank You!</h3>
                <p>We'll contact you within 24 hours.<br/>Or WhatsApp us directly for a faster reply.</p>
                <a
                  className="btn btn-wa"
                  href={waLink("Hello, I just submitted a wholesale enquiry on your website.")}
                  target="_blank" rel="noreferrer"
                  data-testid="success-wa-btn"
                >
                  WhatsApp Us Now
                </a>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate data-testid="enquiry-form">
                <h3 className="form-title">Send a Wholesale Enquiry</h3>

                <div className="form-row">
                  <div className={fieldCls("full_name")}>
                    <label>Full Name *</label>
                    <input type="text" value={form.full_name} onChange={onChange("full_name")} data-testid="input-full-name" />
                    {errors.full_name && <div className="err-msg">{errors.full_name}</div>}
                  </div>
                  <div className={fieldCls("business_name")}>
                    <label>Business / Shop Name *</label>
                    <input type="text" value={form.business_name} onChange={onChange("business_name")} data-testid="input-business-name" />
                    {errors.business_name && <div className="err-msg">{errors.business_name}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={fieldCls("phone")}>
                    <label>WhatsApp / Phone *</label>
                    <input type="tel" value={form.phone} onChange={onChange("phone")} data-testid="input-phone" />
                    {errors.phone && <div className="err-msg">{errors.phone}</div>}
                  </div>
                  <div className={fieldCls("email")}>
                    <label>Email Address</label>
                    <input type="email" value={form.email} onChange={onChange("email")} data-testid="input-email" />
                    {errors.email && <div className="err-msg">{errors.email}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className={fieldCls("city_state")}>
                    <label>City / State</label>
                    <input type="text" value={form.city_state} onChange={onChange("city_state")} data-testid="input-city" />
                  </div>
                  <div className={fieldCls("category")}>
                    <label>Product Category *</label>
                    <select value={form.category} onChange={onChange("category")} data-testid="input-category">
                      <option value="">— Select Category —</option>
                      {FORM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <div className="err-msg">{errors.category}</div>}
                  </div>
                </div>

                <div className={fieldCls("quantity")}>
                  <label>Approx. Quantity Required</label>
                  <input type="text" value={form.quantity} onChange={onChange("quantity")} data-testid="input-quantity" />
                </div>

                <div className={fieldCls("message")}>
                  <label>Message / Requirements</label>
                  <textarea rows={4} value={form.message} onChange={onChange("message")} data-testid="input-message" />
                </div>

                {errors._form && <div className="err-msg" style={{ marginBottom: 12 }}>{errors._form}</div>}

                <button type="submit" className="btn btn-gold btn-block" disabled={submitting} data-testid="submit-btn">
                  {submitting ? "Sending..." : "Send Enquiry →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
