import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PromptForm from "./components/PromptForm";
import OutputPanel from "./components/OutputPanel";
import "./App.css";

const INITIAL_FORM = {
  task: "",
  context: "",
  constraints: "",
  output_format: "",
  length: "",
  source_material: "",
  tone: "",
};

const REQUIRED = ["task", "context", "constraints", "output_format", "length"];

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    for (const field of REQUIRED) {
      if (!formData[field].trim()) {
        newErrors[field] = "This field is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);
    setResult(null);
    setActiveHistoryId(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Something went wrong. Please try again."
        );
      }

      const data = await res.json();
      setResult(data);
      setRefreshKey((k) => k + 1); // refresh sidebar
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setFormData(data.formData);
      setResult(data.result);
      setApiError(null);
      setErrors({});
      setActiveHistoryId(id);
    } catch {
      setApiError("Failed to load history item.");
    }
  };

  const handleNewPrompt = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setApiError(null);
    setErrors({});
    setActiveHistoryId(null);
  };

  return (
    <div className="app-layout">
      <Sidebar
        onSelect={handleHistorySelect}
        activeId={activeHistoryId}
        refreshKey={refreshKey}
      />
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="main-toolbar">
            <button className="btn-new" onClick={handleNewPrompt}>
              + New Prompt
            </button>
          </div>
          <div className="content-grid">
            <PromptForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              errors={errors}
              loading={loading}
            />
            <OutputPanel result={result} loading={loading} error={apiError} />
          </div>
        </main>
      </div>
    </div>
  );
}
