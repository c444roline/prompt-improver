import React from "react";
import SectionHeader from "./SectionHeader";

const FIELDS = [
  {
    name: "task",
    label: "Task",
    required: true,
    helper: "What do you want the AI to do?",
    placeholder:
      "e.g. Summarize this research paper for a non-technical audience...",
    rows: 3,
  },
  {
    name: "context",
    label: "Context",
    required: true,
    helper: "Provide background or information the AI should use.",
    placeholder:
      "e.g. The audience is undergraduate students unfamiliar with machine learning...",
    rows: 2,
  },
  {
    name: "constraints",
    label: "Constraints",
    required: true,
    helper: "One constraint per line (bullet-style).",
    placeholder:
      "Only use provided notes\nRespond concisely\nAvoid technical jargon",
    rows: 3,
  },
  {
    name: "output_format",
    label: "Output Format",
    required: true,
    helper: "Provide the format the AI should use in its output.",
    placeholder: "e.g. Provide a bullet-style output",
    rows: 2,
  },
  {
    name: "length",
    label: "Length",
    required: true,
    helper: "Provide the desired length of the output.",
    placeholder: "e.g. One sentence, one paragraph, a detailed page...",
    rows: 2,
  },
  {
    name: "source_material",
    label: "Source Material",
    required: false,
    helper: "Optional \u2014 paste text, notes, or document content here.",
    placeholder:
      "Paste source text, document excerpts, or notes the AI should reference...",
    rows: 3,
  },
  {
    name: "tone",
    label: "Tone",
    required: false,
    helper: "Optional \u2014 provide the tone the AI should use.",
    placeholder: "e.g. Answer in an educational, kind tone",
    rows: 2,
  },
];

export default function PromptForm({
  formData,
  onChange,
  onSubmit,
  errors,
  loading,
}) {
  return (
    <div className="panel panel-form">
      <SectionHeader
        number={1}
        title="Prompt Input Form"
        subtitle="Fill in the fields below to build a structured prompt."
      />
      <form onSubmit={onSubmit} noValidate>
        <div className="form-fields">
          {FIELDS.map((field) => (
            <div
              key={field.name}
              className={`form-field ${errors[field.name] ? "has-error" : ""}`}
            >
              <label className="form-label" htmlFor={field.name}>
                {field.label.toUpperCase()}
                {field.required && <span className="required"> *</span>}
              </label>
              <p className="form-helper">{field.helper}</p>
              <textarea
                id={field.name}
                name={field.name}
                className="form-textarea"
                rows={field.rows}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={onChange}
                aria-required={field.required}
                aria-invalid={!!errors[field.name]}
              />
              {errors[field.name] && (
                <p className="form-error" role="alert">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="form-divider" />

        <button type="submit" className="btn-generate" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Generating...
            </>
          ) : (
            <>
              <span className="btn-arrow">&rarr;</span>
              Generate Improved Prompt
            </>
          )}
        </button>
      </form>
    </div>
  );
}
