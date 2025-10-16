-- Complete Database Schema for XML Editor Desktop
-- Version: 1.0.0
-- Description: Full database schema with all tables and indexes

-- ==================== MIGRATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  executed_at TEXT NOT NULL
);

-- ==================== DOCUMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  content TEXT NOT NULL,
  xml_content TEXT,
  is_valid INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ==================== AUTOSAVES TABLE ====================
CREATE TABLE IF NOT EXISTS autosaves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_autosaves_document_id ON autosaves(document_id);
CREATE INDEX IF NOT EXISTS idx_autosaves_created_at ON autosaves(created_at);

-- ==================== SETTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ==================== TEMPLATES TABLE ====================
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  schema_version TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_schema_version ON templates(schema_version);

-- ==================== DOCUMENT HISTORY TABLE ====================
CREATE TABLE IF NOT EXISTS document_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  xml_content TEXT,
  is_valid INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_document_id ON document_history(document_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON document_history(created_at);
