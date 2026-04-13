import React, { useState } from "react";
import SectionHeader from "./SectionHeader";

export default function OutputPanel({ result, loading, error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.improved_prompt) return;
    try {
      await navigator.clipboard.writeText(result.improved_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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
      <div className={`output-section ${hasResult ? "expanded" : "collapsed"}`}>
        <SectionHeader
          number={2}
          title="Improved Prompt"
          subtitle={
            hasResult
              ? "Here's an improved prompt given your response to the form."
              : undefined
          }
        />
        {loading && (
          <div className="output-loading">
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block short" />
            <div className="skeleton skeleton-block shorter" />
          </div>
        )}
        {error && (
          <div className="output-error" role="alert">
            <p>{error}</p>
          </div>
        )}
        {hasResult && (
          <div className="output-content">
            <div className="prompt-box">
              <pre className="prompt-text">{result.improved_prompt}</pre>
            </div>
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? "\u2713 Copied!" : "Copy to clipboard"}
            </button>
          </div>
        )}
      </div>

      {/* Section 3: Why This Prompt Works */}
      <div className={`output-section ${hasResult ? "expanded" : "collapsed"}`}>
        <SectionHeader
          number={3}
          title="Why This Prompt Works"
          subtitle={
            hasResult
              ? "Here's what makes the improved prompt effective."
              : undefined
          }
        />
        {loading && (
          <div className="output-loading">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        )}
        {hasResult && (
          <div className="output-content">
            <ul className="explanation-list">
              {(Array.isArray(result.explanation)
                ? result.explanation
                : [result.explanation]
              ).map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section 4: Output */}
      <div className={`output-section ${hasResult ? "expanded" : "collapsed"}`}>
        <SectionHeader
          number={4}
          title="Output"
          subtitle={
            hasResult
              ? "Here's an output directly from an AI chatbot."
              : undefined
          }
        />
        {loading && (
          <div className="output-loading">
            <div className="skeleton skeleton-block" />
            <div className="skeleton skeleton-block" />
          </div>
        )}
        {hasResult && (
          <div className="output-content">
            <div className="sample-box">
              <pre className="sample-text">{result.sample_output}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
