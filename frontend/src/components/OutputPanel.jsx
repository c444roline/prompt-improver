import React, { useState } from "react";
import SectionHeader from "./SectionHeader";

function CollapseToggle({ expanded, onClick }) {
  return (
    <button
      className={`collapse-toggle ${expanded ? "expanded" : "collapsed"}`}
      onClick={onClick}
      aria-label={expanded ? "Collapse section" : "Expand section"}
    >
      <svg width="12" height="12" viewBox="0 0 12 12">
        <polygon
          points={expanded ? "0,0 12,0 6,10" : "0,0 10,6 0,12"}
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

function OutputSection({ number, title, subtitle, loading, children }) {
  const [expanded, setExpanded] = useState(true);
  const hasContent = !!children;

  return (
    <div className="output-section">
      <div className="output-section-header">
        <SectionHeader
          number={number}
          title={title}
          subtitle={hasContent && expanded ? subtitle : undefined}
        />
        {hasContent && (
          <CollapseToggle
            expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          />
        )}
      </div>
      {loading && (
        <div className="output-loading">
          <div className="skeleton skeleton-block" />
          <div className="skeleton skeleton-block short" />
        </div>
      )}
      {hasContent && expanded && (
        <div className="output-content">{children}</div>
      )}
    </div>
  );
}

export default function OutputPanel({ result, loading, error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.improved_prompt) return;
    try {
      await navigator.clipboard.writeText(result.improved_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.improved_prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasResult = result && !loading && !error;

  return (
    <div className="panel panel-output">
      {/* Section 2: Improved Prompt */}
      <OutputSection
        number={2}
        title="Improved Prompt"
        subtitle="Here's an improved prompt given your response to the form."
        loading={loading}
      >
        {error && (
          <div className="output-error" role="alert">
            <p>{error}</p>
          </div>
        )}
        {hasResult && (
          <>
            <div className="prompt-box">
              <pre className="prompt-text">{result.improved_prompt}</pre>
            </div>
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? "\u2713 Copied!" : "Copy to clipboard"}
            </button>
          </>
        )}
      </OutputSection>

      {/* Section 3: Why This Prompt Works */}
      <OutputSection
        number={3}
        title="Why This Prompt Works"
        subtitle="Here's what makes the improved prompt effective."
        loading={loading}
      >
        {hasResult && (
          <ul className="explanation-list">
            {(Array.isArray(result.explanation)
              ? result.explanation
              : [result.explanation]
            ).map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        )}
      </OutputSection>

      {/* Section 4: Output */}
      <OutputSection
        number={4}
        title="Output"
        subtitle="Here's an output directly from an AI chatbot."
        loading={loading}
      >
        {hasResult && (
          <div className="sample-box">
            <pre className="sample-text">{result.sample_output}</pre>
          </div>
        )}
      </OutputSection>
    </div>
  );
}
