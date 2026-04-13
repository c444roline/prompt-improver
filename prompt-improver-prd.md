# Product Requirements Document: Prompt Improver

**Product:** Prompt Improver
**Owner:** Rice University — Transformational Technology & Innovation (TTI)
**Version:** 1.0 (MVP)
**Date:** 2026-04-13
**Status:** Draft

---

## 1. Overview

### Problem Statement

Technical and non-technical AI users at Rice University struggle to generate good AI outputs because their prompts lack clarity, context, and structure. This results in inaccurate responses, wasted time iterating on prompts, and reduced trust in AI tools. Users either lack prompt-engineering knowledge entirely or find the process of writing detailed, structured prompts tedious and time-consuming — even when they know best practices.

### Solution Summary

Prompt Improver is a single-page web application that guides users through a structured input form to capture their intent, context, constraints, and formatting preferences. It then uses an LLM backend to:

1. Generate an **improved prompt** from the structured inputs
2. Explain **why the improved prompt works** (educational component)
3. Produce a **sample output** from the improved prompt so users can evaluate quality immediately

### Goals

- Reduce the time users spend iterating on prompts before getting a satisfactory AI output
- Help non-technical users produce prompts on par with experienced prompt engineers
- Teach users *why* certain prompt structures work, building long-term prompting skills
- Ship an MVP that runs on localhost, deployable to `http://tti.rice.edu/` on Rice GCP

### Non-Goals

- Not a replacement for ChatGPT/Gemini — this tool produces prompts, not a chat interface
- No user accounts or authentication in MVP
- No prompt history or saved sessions in MVP
- No file upload for source material (paste-only in MVP)
- No support for multi-turn or conversational prompt workflows

---

## 2. Users & Personas

### Primary Personas

#### Persona 1: John Smith — Non-Technical User (Student)

| Attribute | Detail |
|---|---|
| Role | Undergraduate student |
| AI usage | Study assistant — uploads lecture notes, asks chatbot to tutor |
| Prompt style | Short (5-6 sentences), stream-of-consciousness, ~1 min to write |
| Pain points | AI forgetting constraints, responses drifting off-topic, overly long outputs |
| Key need | Prompts that work correctly on the first attempt |
| Confidence | Moderate (3/10 difficulty) due to prior prompt-engineering training |
| Preference | Sees all clarification questions at once (not sequentially) |

#### Persona 2: Jane Doe — Technical User (Solutions Analyst)

| Attribute | Detail |
|---|---|
| Role | Solutions Analyst |
| AI usage | Documentation, user stories, presentations, project deliverables |
| Prompt style | Detailed multi-paragraph prompts with examples/constraints; 10-15 min per prompt |
| Pain points | Prompt writing is tedious and time-intensive despite knowing best practices |
| Key need | Save time; improve prompt quality; understand *why* improvements work |
| Confidence | High — believes specificity improves quality |
| Preference | Structured guidance, checklists, tiered levels of detail |

### Key Use Cases

1. **Student studying for an exam** — Pastes lecture notes, asks tool to build a prompt that instructs the AI to tutor from only those notes, in bullet format
2. **Staff member writing documentation** — Enters task (summarize a process), context (audience is new hires), constraints (use only internal docs), and gets a polished prompt
3. **Faculty preparing a presentation** — Needs AI to reformat research findings into slide-friendly bullet points with a professional tone
4. **Researcher exploring a concept** — Wants a detailed explanation constrained to specific source material

---

## 3. User Journeys

### Primary Flow: Generate an Improved Prompt

| Step | User Action | System Response |
|---|---|---|
| 1 | User navigates to the app | App loads showing the **empty form state** (left panel) with placeholder examples, and collapsed output sections (right panel) showing only headers for sections 2/3/4 |
| 2 | User fills in required fields: Task, Context, Constraints, Output Format, Length | Fields accept free-text input; required fields marked with `*` |
| 3 | User optionally fills in: Source Material, Tone | Optional fields accept free-text input |
| 4 | User clicks **"Generate Improved Prompt"** button | System shows loading state; sends structured input to LLM backend |
| 5 | System returns results | Right panel expands to show three sections: **Improved Prompt** (section 2), **Why This Prompt Works** (section 3), **Output** (section 4) |
| 6 | User reads the improved prompt | User can copy the prompt to use in their preferred AI chatbot |
| 7 | User reads "Why This Prompt Works" | Educational bullet points explaining what makes the generated prompt effective |
| 8 | User reviews the sample Output | Sample AI response generated from the improved prompt, so user can evaluate quality |
| 9 | User modifies inputs and re-generates (optional) | User can edit any field and click "Generate" again; right panel updates |

### Edge Cases & Failure States

| Scenario | Expected Behavior |
|---|---|
| User clicks "Generate" with empty required fields | Inline validation error on each empty required field; button disabled or form does not submit |
| LLM API request fails (timeout, 500, rate limit) | Display a user-friendly error message in the output panel: "Something went wrong. Please try again." |
| LLM returns empty or malformed response | Display fallback message: "We couldn't generate a prompt. Please try rephrasing your inputs." |
| User enters extremely long input (>10,000 chars) | **[ASSUMPTION]** Enforce a character limit per field with a visible counter (e.g., Source Material). Exact limits TBD with engineering |
| User pastes special characters / HTML / code | Inputs are sanitized; rendered as plain text in the output |
| Network disconnection mid-request | Show timeout error after threshold; prompt user to retry |
| User re-submits while a request is in flight | Disable the button during loading to prevent duplicate requests |

---

## 4. Functional Requirements

### 4.1 Prompt Input Form (Left Panel — Section 1)

**FR-1.1: Structured Input Fields**
- **Description:** The form collects user intent via 7 fields
- **Priority:** P0
- **Fields:**

| Field | Required | Placeholder / Help Text | Input Type |
|---|---|---|---|
| Task | Yes (`*`) | "e.g. Summarize this research paper for a non-technical audience..." | Textarea (multi-line) |
| Context | Yes (`*`) | "Provide background or information the AI should use." | Textarea |
| Constraints | Yes (`*`) | "One constraint per line (bullet-style)." | Textarea |
| Output Format | Yes (`*`) | "Provide the format the AI should use in its output." | Textarea |
| Length | Yes (`*`) | "e.g. One sentence, one paragraph, a detailed page..." | Textarea |
| Source Material | No | "Optional — paste text, notes, or document content here." | Textarea (larger) |
| Tone | No | "Optional — provide the tone the AI should use." | Textarea |

- **Acceptance Criteria:**
  - **Given** the user loads the page, **When** the form renders, **Then** all 7 fields are visible with placeholder text and required fields are marked with a red asterisk (`*`)
  - **Given** a required field is empty, **When** the user clicks "Generate Improved Prompt", **Then** the form displays inline validation errors and does not submit
  - **Given** all required fields are filled, **When** the user clicks "Generate Improved Prompt", **Then** the form submits successfully

**FR-1.2: Generate Button**
- **Description:** A primary action button labeled "Generate Improved Prompt" with an arrow icon, triggers prompt generation
- **Priority:** P0
- **Acceptance Criteria:**
  - **Given** the form has valid input, **When** the user clicks the button, **Then** the system sends inputs to the backend and shows a loading state
  - **Given** a request is in flight, **When** the user views the button, **Then** the button is disabled to prevent duplicate submissions

### 4.2 Improved Prompt Output (Right Panel — Section 2)

**FR-2.1: Display Improved Prompt**
- **Description:** Renders the LLM-generated improved prompt in a styled text block
- **Priority:** P0
- **Acceptance Criteria:**
  - **Given** the backend returns a successful response, **When** the output renders, **Then** the improved prompt is displayed in a bordered container with readable formatting
  - **Given** the response includes structured sections (Requirements, Output format, Tone, Length), **When** rendered, **Then** each section is visually distinguishable

**FR-2.2: Copy Improved Prompt**
- **Description:** User can copy the improved prompt to clipboard
- **Priority:** P1
- **Acceptance Criteria:**
  - **Given** an improved prompt is displayed, **When** the user clicks a copy button, **Then** the full prompt text is copied to the clipboard and a confirmation is shown
- **[ASSUMPTION]:** Copy button is not visible in the Figma mockup but is a strong UX expectation. Flagged for design confirmation.

### 4.3 Why This Prompt Works (Right Panel — Section 3)

**FR-3.1: Display Explanation**
- **Description:** Shows bullet-point explanation of why the improved prompt is effective
- **Priority:** P0
- **Acceptance Criteria:**
  - **Given** a successful generation, **When** the explanation renders, **Then** it displays as a bulleted list explaining specific improvements (e.g., "Clearly defines the role of the AI", "Specifies a structured output format")
  - **Given** the user reads the explanation, **When** they compare it to their original input, **Then** the explanation maps to concrete differences between the input and improved prompt

### 4.4 Sample Output (Right Panel — Section 4)

**FR-4.1: Display Sample AI Output**
- **Description:** Shows a sample response that the improved prompt would produce, generated by the LLM
- **Priority:** P0
- **Acceptance Criteria:**
  - **Given** a successful generation, **When** the sample output renders, **Then** it displays formatted text that demonstrates the quality of the improved prompt
  - **Given** the user specified "bullet points" as output format, **When** the sample output renders, **Then** it uses bullet-point formatting

### 4.5 Header & Navigation

**FR-5.1: Branding Header**
- **Description:** Top bar with Rice University shield logo, "Rice University" text, and "Transformational Technology & Innovation" subtitle. Navigation bar with: Home, Our Products (dropdown), Trainings (dropdown), About Us, Contact Us
- **Priority:** P1 (for localhost MVP, a simplified header is acceptable)
- **Acceptance Criteria:**
  - **Given** the user loads the page, **When** the header renders, **Then** the Rice logo and TTI branding are visible
  - **Given** the page is hosted on `tti.rice.edu`, **When** navigation links are clicked, **Then** they route to the correct TTI site pages

---

## 5. Non-Functional Requirements

### Performance

| Requirement | Target | Priority |
|---|---|---|
| Page load time (initial) | < 2 seconds | P0 |
| Prompt generation (end-to-end) | < 15 seconds | P0 |
| Time to interactive | < 3 seconds | P1 |

- **[ASSUMPTION]:** Generation time depends on the chosen LLM and whether the three outputs (improved prompt, explanation, sample output) are generated in a single call or multiple calls. Single-call is recommended for MVP to minimize latency.

### Reliability

- The app should gracefully handle LLM API failures with user-facing error messages
- No data loss on page refresh (form inputs are ephemeral in MVP — this is acceptable)
- **[ASSUMPTION]:** No SLA requirement for MVP; production deployment on Rice GCP should target 99.5% uptime

### Security & Privacy

| Requirement | Priority |
|---|---|
| All user inputs are transmitted over HTTPS | P0 |
| No user data is stored or logged beyond the session | P0 |
| Input sanitization to prevent XSS | P0 |
| LLM API key is server-side only, never exposed to client | P0 |
| **[ASSUMPTION]:** No PII handling beyond what users voluntarily paste into the form | — |

### Accessibility

| Requirement | Priority |
|---|---|
| WCAG 2.1 AA compliance | P1 |
| All form fields have associated labels | P0 |
| Keyboard navigable (tab through fields, Enter to submit) | P1 |
| Sufficient color contrast (Rice navy `#00205B` on white passes AA) | P1 |
| Screen reader compatible (semantic HTML, ARIA labels) | P1 |

---

## 6. UX/UI Notes

### Key Screens (from Figma)

The Figma file contains **three frames** representing UI states:

#### Screen 1: Empty State ("Start page - Empty fields")
- Left panel: Input form with all fields showing placeholder/example text
- Right panel: Sections 2 (Improved Prompt), 3 (Why This Prompt Works), and 4 (Output) are **collapsed** — showing only numbered headers with no content
- This is the landing state when the user first visits the page

#### Screen 2: Filled Fields (Pre-Submit)
- Left panel: All form fields populated with user input (e.g., Task: "Explain Bell-LaPadula", Context: "This is for a Computer security class")
- Right panel: Still collapsed — no output yet
- Represents the state after the user fills the form but before clicking "Generate"

#### Screen 3: Output (Post-Submit)
- Left panel: Form fields retain user input
- Right panel: All three output sections expanded with content:
  - **Section 2 — Improved Prompt:** Full structured prompt text in a bordered box
  - **Section 3 — Why This Prompt Works:** Bulleted explanation (e.g., "Clearly defines the role of the AI (computer security tutor)")
  - **Section 4 — Output:** Sample AI response with bullet points showing Bell-LaPadula concepts

### Layout Details

- **Two-column layout:** Left column (~50%) for input form, right column (~50%) for output
- **Header:** Rice shield + TTI branding bar (navy background), followed by hero image banner, followed by navigation bar (Home, Our Products, Trainings, About Us, Contact Us)
- **Section numbering:** Each panel section has a circled number (1, 2, 3, 4) with a bold heading
- **Typography:** Sans-serif; field labels are bold uppercase; helper text is regular weight, smaller size
- **Input fields:** Light-bordered rectangular textareas with consistent padding
- **Button:** Full-width within the form column, navy/dark background with white text and arrow icon

### Interaction States

| State | Behavior |
|---|---|
| **Empty / Default** | Form fields show placeholder text; output sections collapsed to headers only |
| **Filled (pre-submit)** | Placeholder text replaced by user input; output still collapsed |
| **Loading** | **[ASSUMPTION — not in Figma]:** Button shows a spinner or "Generating..." text; output area shows a skeleton/loading indicator |
| **Success (post-submit)** | Output sections expand with generated content; form retains inputs for editing |
| **Error** | **[ASSUMPTION — not in Figma]:** Error banner or inline message in the output area; form remains editable |
| **Empty output on error** | Output sections remain collapsed or show a single error message |

### Missing from Figma (Flagged)

- Loading/spinner state during generation
- Error state UI
- Copy-to-clipboard button on the improved prompt
- Mobile/responsive layout
- Character counters or limits on input fields
- "Clear form" or "Reset" action

---

## 7. Data & Integrations

### Data Model (High-Level)

No persistent data storage in MVP. All data is ephemeral and lives in the client session.

**Request Payload (Client → Server):**

```json
{
  "task": "string (required)",
  "context": "string (required)",
  "constraints": "string (required)",
  "output_format": "string (required)",
  "length": "string (required)",
  "source_material": "string (optional)",
  "tone": "string (optional)"
}
```

**Response Payload (Server → Client):**

```json
{
  "improved_prompt": "string",
  "explanation": "string (or string[])",
  "sample_output": "string"
}
```

### APIs & Third-Party Integrations

| Integration | Purpose | Notes |
|---|---|---|
| LLM API (e.g., OpenAI, Anthropic, or Google) | Generate improved prompt, explanation, and sample output | **[OPEN QUESTION]** Which LLM provider? Must be compatible with Rice GCP and any institutional agreements |
| Rice GCP | Hosting for production deployment | Constraint from stakeholder requirements |

### Backend Architecture (Assumed)

- **[ASSUMPTION]:** A lightweight backend (e.g., Python/Flask, Node/Express) that:
  1. Receives the structured form data
  2. Constructs a meta-prompt (a prompt that instructs the LLM to improve the user's prompt)
  3. Calls the LLM API
  4. Parses the LLM response into the three output sections
  5. Returns structured JSON to the frontend
- **[OPEN QUESTION]:** Technology stack not specified. Recommend Python/Flask or FastAPI for Rice ecosystem compatibility, with a simple React or vanilla HTML/JS/CSS frontend.

---

## 8. Metrics & Success Criteria

### KPIs

| Metric | Definition | Target (MVP) |
|---|---|---|
| **Task completion rate** | % of users who fill the form and click "Generate" | > 70% |
| **Prompt quality improvement** | User-rated quality of improved prompt vs. their original input (survey) | > 3.5/5 average |
| **Time savings** | Self-reported time saved vs. manual prompt writing (survey) | > 50% reduction |
| **First-attempt accuracy** | % of users satisfied with the output without re-generating | > 60% |
| **Educational value** | % of users who report learning something from "Why This Prompt Works" | > 50% |
| **Error rate** | % of generation attempts that fail | < 5% |

### Instrumentation Plan

| Event | Data Captured | Purpose |
|---|---|---|
| `page_load` | Timestamp, referrer | Track adoption and traffic source |
| `form_submit` | Timestamp, which fields were filled, character counts (not content) | Understand usage patterns without storing PII |
| `generation_success` | Timestamp, latency | Monitor performance |
| `generation_error` | Timestamp, error type | Monitor reliability |
| `copy_prompt` | Timestamp | Measure the most valuable action |

- **[ASSUMPTION]:** Analytics via lightweight client-side events (e.g., Google Analytics or a simple server-side log). No user-identifiable data is collected.
- **[OPEN QUESTION]:** Does Rice have a preferred analytics platform or privacy policy that constrains instrumentation?

---

## 9. Rollout Plan

### Milestones

| Phase | Milestone | Scope |
|---|---|---|
| **M0: Localhost MVP** | Working prototype on `localhost` | Full input form → LLM call → display improved prompt + explanation + sample output. Minimal styling. |
| **M1: Styled MVP** | Pixel-accurate to Figma mockup | Rice branding, responsive layout, loading/error states, copy button |
| **M2: GCP Deployment** | Live on Rice GCP at `tti.rice.edu` | Production backend, HTTPS, environment config, error monitoring |
| **M3: User Testing** | Usability testing with 5-8 Rice users | Recruit from both personas (students + staff); gather qualitative + quantitative feedback |
| **M4: Iteration** | Incorporate user testing feedback | UI refinements, prompt template tuning, performance optimization |

### MVP vs. Future Scope

| Feature | MVP (v1) | Future (v2+) |
|---|---|---|
| Structured input form (7 fields) | Yes | Yes |
| LLM-generated improved prompt | Yes | Yes |
| "Why This Prompt Works" explanation | Yes | Yes |
| Sample output preview | Yes | Yes |
| Copy to clipboard | Yes | Yes |
| User accounts / login | No | Possible (Rice SSO / NetID) |
| Prompt history / saved prompts | No | Yes |
| File upload for source material | No | Yes (PDF, DOCX) |
| Multiple LLM model selection | No | Yes |
| Side-by-side comparison (original vs. improved) | No | Yes |
| Prompt templates / presets by use case | No | Yes |
| Interactive clarification questions | No | Possible (guided wizard mode) |
| Mobile-responsive layout | Partial | Full |
| Internationalization | No | Possible |
| Usage analytics dashboard | Basic logging | Full dashboard |

---

## 10. Risks & Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM API costs scale with usage | Medium | Medium | Set rate limits per session; monitor usage; consider caching common patterns |
| LLM generates low-quality or hallucinated "improved" prompts | Medium | High | Carefully engineer the meta-prompt; include guardrails; allow users to regenerate |
| Users don't understand the form fields | Medium | Medium | Placeholder examples guide users; "Why This Prompt Works" educates |
| Rice GCP infrastructure constraints limit tech stack choices | Low | Medium | Validate GCP compatibility early; use standard runtimes (Python, Node) |
| Users paste sensitive/confidential data into Source Material | Medium | High | Add a disclaimer: "Do not paste confidential information"; do not log input content |

### Explicit Assumptions

1. **No authentication required** for MVP — the tool is publicly accessible
2. **Single LLM call** generates all three outputs (improved prompt, explanation, sample output) to minimize latency
3. **No persistent storage** — all data is session-scoped and ephemeral
4. **Desktop-first** — responsive mobile layout is a P2 concern
5. **English-only** for MVP
6. **Character limits** on input fields exist but exact values are TBD with engineering
7. **The meta-prompt** (system prompt used to instruct the LLM to improve user prompts) will be developed and iterated separately and is not specified in this PRD

### Open Questions Requiring Clarification

| # | Question | Owner | Impact |
|---|---|---|---|
| OQ-1 | Which LLM provider will be used (OpenAI, Anthropic, Google, self-hosted)? | Engineering / TTI | Determines API integration, cost model, and GCP compatibility |
| OQ-2 | What is the tech stack for frontend and backend? | Engineering | Determines build timeline and developer resourcing |
| OQ-3 | Are there Rice institutional policies on LLM API usage, data handling, or analytics? | TTI / Legal | May constrain data flow and instrumentation |
| OQ-4 | Should the nav bar links (Home, Our Products, etc.) be functional in MVP or static? | Product / Design | Affects scope |
| OQ-5 | Is there a budget ceiling for LLM API costs? | TTI | Affects rate limiting and caching strategy |
| OQ-6 | Should loading and error states be designed in Figma before implementation? | Design | Currently missing from mockup |
| OQ-7 | Should the "Generate" action produce all 3 outputs simultaneously, or should they stream in progressively? | Engineering / Product | Affects perceived performance |
| OQ-8 | What is the maximum input length per field (especially Source Material)? | Product / Engineering | Affects LLM token usage and cost |

---

## 11. Appendix

### A. Raw Notes → Requirements Mapping

| Raw Insight | Derived Requirement |
|---|---|
| "Users write vague prompts missing context/constraints/formatting" | FR-1.1: Structured form with dedicated fields for Task, Context, Constraints, Output Format, Length |
| "Users lack prompt engineering knowledge" | FR-3.1: "Why This Prompt Works" educational section |
| "Users are tired of revising prompts multiple times" | FR-4.1: Sample Output so users can evaluate quality before going to their chatbot |
| Omar: "prefers seeing all clarification questions at once" | Single-page form (not a multi-step wizard) showing all fields simultaneously |
| Elisa: "spends 10-15 minutes writing detailed prompts" | The tool automates prompt structuring, targeting < 2 min form completion |
| Elisa: "wants a tool that explains *why* improvements work" | FR-3.1: Explanation section with specific improvement rationale |
| Omar: "AI forgetting constraints over time" | Constraints are baked into the generated prompt text, not relying on chat memory |
| Omar: "overly long outputs take time to read" | Length field lets users specify desired output length |
| John: "wants prompts that work on the first attempt" | Core value proposition — structured prompts yield better first-attempt results |
| Jane: "a checklist would help" | The form itself acts as a structured checklist for prompt components |

### B. Figma Screen Reference

| Frame | Name | State | Node ID |
|---|---|---|---|
| 1 | Start page - Empty fields | Default/empty state with placeholders | `1:2` |
| 2 | Filled fields | Form filled, output collapsed | `1:359` |
| 3 | Output | Full output with improved prompt, explanation, and sample | `1:633` |

**Figma URL:** `https://www.figma.com/design/vEVuZZvWZv4q76jIJI7niD/Prompt-Improver-Mockup?node-id=1-633&m=dev`

### C. Form Field Detail from Figma

| Field | Label Text | Helper Text | Placeholder Example |
|---|---|---|---|
| Task | `TASK *` | "What do you want the AI to do?" | "e.g. Summarize this research paper for a non-technical audience..." |
| Context | `CONTEXT *` | "Provide background or information the AI should use." | "e.g. The audience is undergraduate students unfamiliar with machine learning..." |
| Constraints | `CONSTRAINTS *` | "One constraint per line (bullet-style)." | "Only use provided notes / Respond concisely / Avoid technical jargon" |
| Output Format | `OUTPUT FORMAT *` | "Provide the format the AI should use in its output." | "e.g. Provide a bullet-style output" |
| Length | `LENGTH *` | "Provide the desired length of the output." | "e.g. One sentence, one paragraph, a detailed page..." |
| Source Material | `SOURCE MATERIAL` | "Optional — paste text, notes, or document content here." | "Paste source text, document excerpts, or notes the AI should reference..." |
| Tone | `TONE` | "Optional — provide the tone the AI should use." | "e.g. Answer in an educational, kind tone" |
