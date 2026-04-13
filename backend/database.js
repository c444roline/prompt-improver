const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "prompt_improver.db");

let db;
let SQL;

async function getDb() {
  if (db) return db;

  SQL = await initSqlJs();

  // Load existing DB file or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      context TEXT NOT NULL,
      constraints_text TEXT NOT NULL,
      output_format TEXT NOT NULL,
      length TEXT NOT NULL,
      source_material TEXT,
      tone TEXT,
      improved_prompt TEXT,
      explanation TEXT,
      sample_output TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      user_id TEXT
    )
  `);

  save();
  return db;
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function insertGeneration(input, result) {
  if (!db) return;
  db.run(
    `INSERT INTO generations (task, context, constraints_text, output_format, length, source_material, tone, improved_prompt, explanation, sample_output)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.task,
      input.context,
      input.constraints,
      input.output_format,
      input.length,
      input.source_material,
      input.tone,
      result.improved_prompt,
      JSON.stringify(result.explanation),
      result.sample_output,
    ]
  );
  save();
}

module.exports = { getDb, insertGeneration };
