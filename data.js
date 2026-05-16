// Shared site data
export const PHONE_PRIMARY = "90043 56576";
export const PHONE_PRIMARY_RAW = "919004356576";
export const PHONE_ALT = "98209 18646";
export const PHONE_ALT_RAW = "919820918646";

export const waLink = (text) =>
  `https://wa.me/${PHONE_PRIMARY_RAW}?text=${encodeURIComponent(text)}`;

export const HERO_SLIDES = [
  { key: "hero-1", pill: "✦ WHOLESALE ONLY", title: "Fancy Latkans\nFor Every Occasion" },
  { key: "hero-2", pill: "✦ WHOLESALE ONLY", title: "Exquisite Laces\n& Fine Borders" },
  { key: "hero-3", pill: "✦ WHOLESALE ONLY", title: "Bridal Kalire\n& Silk Tassels" },
  { key: "hero-4", pill: "✦ WHOLESALE ONLY", title: "Designer Patches\n& Stone Work" },
  { key: "hero-5", pill: "✦ WHOLESALE ONLY", title: "Festive Decoratives\nWholesale Only" },
];

export const MARQUEE_ITEMS = [
  "Fancy Latkans", "Stone Work", "Resham Work", "Saree Borders", "Laces",
  "Kalire", "Tassels", "Patches", "Festive Decor", "Wholesale Only",
  "Pan-India Shipping", "Worldwide Export",
];

export const STATS = [
  { num: 500, suffix: "+", label: "Designs Available" },
  { num: 15,  suffix: "+", label: "Years of Experience" },
  { text: "Pan-India", label: "Shipping Coverage" },
  { text: "Worldwide", label: "Export Available" },
];

export const CATEGORIES = [
  {
    id: "latkans", img: "cat-1", name: "Fancy Latkans",
    bullets: ["Stone & mirror work designs", "Multi-color resham work", "Bridal & casual collections"],
  },
  {
    id: "laces", img: "cat-2", name: "Laces & Borders",
    bullets: ["Saree borders by the meter", "Cutwork & laser-cut designs", "Zari & resham work laces"],
  },
  {
    id: "kalire", img: "cat-3", name: "Kalire & Tassels",
    bullets: ["Bridal kalire pairs", "Festive silk tassels", "Lehenga hem tassels"],
  },
  {
    id: "patches", img: "cat-4", name: "Patches & Buttons",
    bullets: ["Diamond rhinestone patches", "Embroidery applique patches", "Designer kundan buttons"],
  },
  {
    id: "festive", img: "cat-5", name: "Festive Items",
    bullets: ["Diwali latkan torans", "Navratri special collections", "Wedding mandap decoratives"],
  },
  {
    id: "stonework", img: "cat-6", name: "Stone & Resham Work",
    bullets: ["Hand-embroidered stone work", "Silk resham designs", "Custom bulk orders welcome"],
  },
];

export const PRODUCTS = [
  { id: 1,  img: "prod-1",  name: "Multi-Color Stone Latkan",  cat: "latkans", desc: "Vibrant stone-work tassels, ideal for bridal & festive sarees." },
  { id: 2,  img: "prod-2",  name: "Maroon Resham Latkan",      cat: "latkans", desc: "Hand-embroidered resham work in deep maroon thread." },
  { id: 3,  img: "prod-3",  name: "Golden Zari Bridal Latkan", cat: "latkans", desc: "Premium golden zari work for high-end bridal wear." },
  { id: 4,  img: "prod-4",  name: "Mirror Work Latkan",        cat: "latkans", desc: "Sparkling mirror embellishments, festive favorite." },
  { id: 5,  img: "prod-5",  name: "Zari Saree Border Lace",    cat: "laces",   desc: "Gold zari border by the meter, available in bulk rolls." },
  { id: 6,  img: "prod-6",  name: "Cutwork Fancy Border",      cat: "laces",   desc: "Laser-cut intricate designs for designer sarees & lehengas." },
  { id: 7,  img: "prod-7",  name: "Gold Bridal Kalire Pair",   cat: "kalire",  desc: "Traditional gold kalire pair for bridal trousseau." },
  { id: 8,  img: "prod-8",  name: "Multi-Color Silk Tassel",   cat: "kalire",  desc: "Bright silk tassels for lehenga hems and festive decor." },
  { id: 9,  img: "prod-9",  name: "Diamond Rhinestone Patch",  cat: "patches", desc: "Premium rhinestone patches with secure backing." },
  { id: 10, img: "prod-10", name: "Embroidery Applique Patch", cat: "patches", desc: "Hand-stitched embroidery patches in vivid colors." },
  { id: 11, img: "prod-11", name: "Diwali Latkan Toran",       cat: "festive", desc: "Festive door-hanging toran set for Diwali & weddings." },
  { id: 12, img: "prod-12", name: "Navratri Tassel Set",       cat: "festive", desc: "Bright tassel decorations for Navratri & garba events." },
  // Additional 8 (using category fallbacks)
  { id: 13, img: "cat-1",   name: "Bridal Latkan Collection",  cat: "latkans", desc: "Curated bridal latkan set in assorted designs." },
  { id: 14, img: "cat-1",   name: "Casual Latkan Set",         cat: "latkans", desc: "Everyday latkans in soft pastel tones." },
  { id: 15, img: "cat-2",   name: "Designer Lace Roll",        cat: "laces",   desc: "Premium designer lace roll, factory rates." },
  { id: 16, img: "cat-2",   name: "Resham Border Lace",        cat: "laces",   desc: "Silk resham woven borders, festive ready." },
  { id: 17, img: "cat-3",   name: "Bridal Tassel Bundle",      cat: "kalire",  desc: "Bundle of premium bridal tassels in mixed colors." },
  { id: 18, img: "cat-4",   name: "Kundan Designer Button",    cat: "patches", desc: "Kundan-set buttons, sold per dozen wholesale." },
  { id: 19, img: "cat-5",   name: "Wedding Mandap Set",        cat: "festive", desc: "Decorative latkans for mandap & stage decor." },
  { id: 20, img: "cat-6",   name: "Stone Work Bulk Pack",      cat: "festive", desc: "Bulk pack of assorted stone work pieces." },
];

export const FILTERS = [
  { id: "all",     label: "All Products" },
  { id: "latkans", label: "Latkans" },
  { id: "laces",   label: "Laces & Borders" },
  { id: "kalire",  label: "Kalire & Tassels" },
  { id: "patches", label: "Patches & Buttons" },
  { id: "festive", label: "Festive" },
];

export const WHY_FEATURES = [
  { n: "01", t: "Wholesale Pricing", d: "Factory-direct rates, no retail markups" },
  { n: "02", t: "500+ Designs",      d: "Latkans, laces, patches in every style" },
  { n: "03", t: "Fast Dispatch",     d: "Bulk orders packed and shipped quickly" },
  { n: "04", t: "India + Worldwide", d: "Nationwide and international shipping" },
];

export const HOW_STEPS = [
  { n: 1, t: "Browse",   d: "Explore our 6+ categories and 500+ designs" },
  { n: 2, t: "WhatsApp", d: "Send us your requirements and quantity on WhatsApp" },
  { n: 3, t: "Receive",  d: "We confirm, pack, and dispatch your order" },
];

export const CUSTOMER_CHIPS = [
  { icon: "🧵", label: "Saree Manufacturers" },
  { icon: "👗", label: "Lehenga Makers" },
  { icon: "💍", label: "Chudi Wholesalers" },
  { icon: "🛍️", label: "Fashion Shops" },
  { icon: "🪔", label: "Festive Suppliers" },
  { icon: "🌍", label: "Global Exporters" },
];

export const FORM_CATEGORIES = [
  "Fancy Latkans", "Laces & Borders", "Kalire & Tassels",
  "Patches & Buttons", "Festive Decoration Items", "Multiple Categories",
];
