const express = require("express");
const { getDb } = require("../database");

const router = express.Router();

// Get all generations (most recent first), returning summary for sidebar
router.get("/", async (_req, res) => {
  try {
    const db = await getDb();
    const stmt = db.prepare(
      "SELECT id, task, improved_prompt, explanation, sample_output, created_at FROM generations ORDER BY id DESC LIMIT 50"
    );
    const rows = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push({
        id: row.id,
        title: row.task.length > 60 ? row.task.slice(0, 57) + "..." : row.task,
        task: row.task,
        created_at: row.created_at,
      });
    }
    stmt.free();
    return res.json(rows);
  } catch (err) {
    console.error("[history] Error:", err.message);
    return res.status(500).json({ error: "Failed to load history" });
  }
});

// Get a single generation by ID
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const stmt = db.prepare("SELECT * FROM generations WHERE id = ?");
    stmt.bind([Number(req.params.id)]);
    if (!stmt.step()) {
      stmt.free();
      return res.status(404).json({ error: "Not found" });
    }
    const row = stmt.getAsObject();
    stmt.free();

    let explanation;
    try {
      explanation = JSON.parse(row.explanation);
    } catch {
      explanation = [row.explanation];
    }

    return res.json({
      id: row.id,
      formData: {
        task: row.task,
        context: row.context,
        constraints: row.constraints_text,
        output_format: row.output_format,
        length: row.length,
        source_material: row.source_material || "",
        tone: row.tone || "",
      },
      result: {
        improved_prompt: row.improved_prompt,
        explanation,
        sample_output: row.sample_output,
      },
      created_at: row.created_at,
    });
  } catch (err) {
    console.error("[history] Error:", err.message);
    return res.status(500).json({ error: "Failed to load generation" });
  }
});

module.exports = router;
