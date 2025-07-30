import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

let db: Database | null = null;

export async function initializeDatabase() {
  const dbPath = path.join(__dirname, "../../moqqins.db");

  console.log(`📂 Initializing database at: ${dbPath}`);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.exec("PRAGMA foreign_keys = ON");

  // Create tables
  await createTables();

  console.log("✅ Database initialized successfully");
  return db;
}

async function createTables() {
  if (!db) throw new Error("Database not initialized");

  console.log("🏗️  Creating database tables...");

  // Projects table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      figma_file_id TEXT UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Versions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      message TEXT,
      author TEXT,
      document_data TEXT,
      file_size INTEGER DEFAULT 0,
      is_auto_save BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_versions_created ON versions(created_at)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_projects_figma_id ON projects(figma_file_id)`
  );

  console.log("✅ Database tables created successfully");
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return db;
}

// Graceful shutdown
export async function closeDatabase() {
  if (db) {
    await db.close();
    console.log("📂 Database connection closed");
  }
}
