import React from "react";

// Images are served directly from the frontend public folder (works in dev & build)
export default function GenImage({ name, alt, className, loading = "lazy", style }) {
  const src = `/images/${name}.png`;
  return (
    <img
      src={src}
      alt={alt || name}
      loading={loading}
      className={className}
      style={style}
      data-testid={`img-${name}`}
      onError={(e) => { e.currentTarget.style.background = "#F0E0C0"; }}
    />
  );
}
