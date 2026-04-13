import React, { useEffect, useState } from "react";

export default function Sidebar({ onSelect, activeId, refreshKey }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [refreshKey]);

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        {open ? "\u2039" : "\u203A"}
      </button>

      {open && (
        <>
          <div className="sidebar-header">
            <h3>History</h3>
          </div>
          <div className="sidebar-list">
            {items.length === 0 && (
              <p className="sidebar-empty">No prompts yet.</p>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activeId === item.id ? "active" : ""}`}
                onClick={() => onSelect(item.id)}
                title={item.task}
              >
                <span className="sidebar-item-title">{item.title}</span>
                <span className="sidebar-item-date">
                  {new Date(item.created_at + "Z").toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
