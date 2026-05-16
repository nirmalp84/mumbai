import React from "react";
import { Helmet } from "react-helmet-async";

const SITE = "Dream's Latkans & Laces";
const DESC_DEFAULT = "Mumbai's trusted wholesale supplier of fancy latkans, laces, borders, kalire, tassels, patches & festive decoratives. Pan-India & worldwide shipping. WhatsApp: 90043 56576.";

export default function SEO({
  title,
  description = DESC_DEFAULT,
  path = "/",
  image = "/images/og-default.png",
}) {
  const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Wholesale, Mumbai`;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${path}`;
  const absImage = image.startsWith("http") ? image : `${origin}${image}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absImage} />
      <meta property="og:site_name" content={SITE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />
    </Helmet>
  );
}
