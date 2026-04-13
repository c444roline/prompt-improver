const express = require("express");
const { generate } = require("../services/llm");
const { insertGeneration } = require("../database");

const router = express.Router();

const REQUIRED_FIELDS = ["task", "context", "constraints", "output_format", "length"];
const MAX_FIELD_LENGTH = 10000;

router.post("/", async (req, res) => {
  // Validate required fields
  const errors = {};
  for (const field of REQUIRED_FIELDS) {
    if (!req.body[field] || !req.body[field].trim()) {
      errors[field] = `${field} is required`;
    }
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed", fields: errors });
  }

  // Enforce character limits
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === "string" && value.length > MAX_FIELD_LENGTH) {
      return res.status(400).json({
        error: `${key} exceeds maximum length of ${MAX_FIELD_LENGTH} characters`,
      });
    }
  }

  const input = {
    task: req.body.task.trim(),
    context: req.body.context.trim(),
    constraints: req.body.constraints.trim(),
    output_format: req.body.output_format.trim(),
    length: req.body.length.trim(),
    source_material: req.body.source_material?.trim() || null,
    tone: req.body.tone?.trim() || null,
  };

  try {
    const result = await generate(input);

    // Persist to SQLite
    try {
      insertGeneration(input, result);
    } catch (dbErr) {
      console.error("[db] Failed to persist generation:", dbErr.message);
      // Don't fail the request if DB write fails
    }

    return res.json(result);
  } catch (err) {
    console.error("[generate] Error:", err.message);
    return res.status(500).json({
      error: err.message || "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;
