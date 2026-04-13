import React from "react";

const NAV_ITEMS = ["Home", "Our Products", "Trainings", "About Us", "Contact Us"];

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">
          <svg viewBox="0 0 28 28" width="28" height="28" fill="white">
            <path d="M14 0C6.27 0 0 6.27 0 14s6.27 14 14 14 14-6.27 14-14S21.73 0 14 0zm0 2c6.627 0 12 5.373 12 12s-5.373 12-12 12S2 20.627 2 14 7.373 2 14 2zm-3 7v10h2v-4h2c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4zm2 2h2c1.105 0 2 .895 2 2s-.895 2-2 2h-2V11z" />
          </svg>
        </div>
        <div className="header-text">
          <span className="header-university">Rice University</span>
          <span className="header-department">
            Transformational Technology &amp; Innovation
          </span>
        </div>
      </div>
      <nav className="header-nav">
        {NAV_ITEMS.map((item) => (
          <a key={item} href="#" className="header-nav-link">
            {item}
            {(item === "Our Products" || item === "Trainings") && (
              <span className="nav-caret"> &#9662;</span>
            )}
          </a>
        ))}
      </nav>
    </header>
  );
}
