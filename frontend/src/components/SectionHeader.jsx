import React from "react";

export default function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="section-header">
      <div className="section-header-row">
        <span className="section-number">{number}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
