require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getDb } = require("./database");
const generateRouter = require("./routes/generate");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", llm: process.env.OPENAI_API_KEY ? "live" : "mock" });
});

// Main route
app.use("/api/generate", generateRouter);

// Initialize DB then start server
getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] Prompt Improver API running on http://localhost:${PORT}`);
    console.log(`[server] LLM mode: ${process.env.OPENAI_API_KEY ? "OpenAI (live)" : "Mock (no API key)"}`);
  });
});
