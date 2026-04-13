const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `You are a prompt-engineering expert. The user will give you structured information about a task they want an AI chatbot to perform. Your job is to produce three things:

1. **Improved Prompt**: A single, polished prompt that the user can paste directly into any AI chatbot. Incorporate the task, context, constraints, output format, length, tone, and any source material into one cohesive prompt. Use clear sections within the prompt (e.g., "Requirements:", "Output format:", "Tone:", "Length:").

2. **Explanation**: A bullet-point list (3-6 bullets) explaining WHY the improved prompt is better than a naive version. Focus on specific techniques used (role assignment, explicit constraints, structured output, etc.).

3. **Sample Output**: A realistic sample response that an AI chatbot would produce when given the improved prompt. Match the requested output format, length, and tone.

Return your response as valid JSON with exactly these keys:
{
  "improved_prompt": "...",
  "explanation": ["bullet 1", "bullet 2", ...],
  "sample_output": "..."
}

Return ONLY the JSON object. No markdown fences, no extra text.`;

function buildUserMessage(input) {
  let msg = `Task: ${input.task}\nContext: ${input.context}\nConstraints: ${input.constraints}\nOutput Format: ${input.output_format}\nLength: ${input.length}`;
  if (input.source_material) msg += `\nSource Material: ${input.source_material}`;
  if (input.tone) msg += `\nTone: ${input.tone}`;
  return msg;
}

function getMockResponse(input) {
  return {
    improved_prompt: `You are an expert assistant helping with the following task: ${input.task}.\n\nContext: ${input.context}\n\nRequirements:\n- ${input.constraints.split("\n").join("\n- ")}\n\nOutput format: ${input.output_format}\n\nTone: ${input.tone || "Professional and clear"}.\n\nLength: ${input.length}.${input.source_material ? `\n\nReference material:\n${input.source_material}` : ""}`,
    explanation: [
      "Assigns a clear role to the AI, setting expectations for expertise level.",
      "Explicitly includes all constraints as a checklist the AI must follow.",
      "Specifies the exact output format, reducing ambiguity in the response structure.",
      "Defines tone and length so the response matches the user's needs on the first attempt.",
      input.source_material
        ? "Embeds the source material directly, preventing the AI from hallucinating outside the provided content."
        : "Provides sufficient context so the AI can respond accurately without guessing.",
    ],
    sample_output: `Here is a sample response for "${input.task}":\n\n\u2022 This is a demonstration of what the AI would produce using the improved prompt.\n\u2022 The output follows the requested format: ${input.output_format}.\n\u2022 It respects the specified length: ${input.length}.\n\u2022 Constraints are honored throughout the response.\n\n(This is mock data \u2014 connect a Gemini API key for real LLM output.)`,
  };
}

async function generate(input) {
  if (!process.env.GEMINI_API_KEY) {
    console.log("[LLM] No Gemini API key found \u2014 returning mock response");
    return getMockResponse(input);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n\n" + buildUserMessage(input) }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  });

  let text = result.response.text().trim();

  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    const parsed = JSON.parse(text);
    if (!parsed.improved_prompt || !parsed.explanation || !parsed.sample_output) {
      throw new Error("Missing required fields in LLM response");
    }
    if (typeof parsed.explanation === "string") {
      parsed.explanation = parsed.explanation.split("\n").filter(Boolean);
    }
    return parsed;
  } catch {
    console.error("[LLM] Failed to parse response:", text);
    throw new Error("LLM returned an invalid response. Please try again.");
  }
}

module.exports = { generate };
