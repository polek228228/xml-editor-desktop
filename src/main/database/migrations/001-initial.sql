-- Migration: 001-initial
-- Description: Initial database schema for documents, autosaves, and settings
-- Created: 2025-10-02

-- Documents table
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

-- Autosaves table
CREATE TABLE IF NOT EXISTS autosaves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Indexes for autosaves
CREATE INDEX IF NOT EXISTS idx_autosaves_document_id ON autosaves(document_id);
CREATE INDEX IF NOT EXISTS idx_autosaves_created_at ON autosaves(created_at);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
