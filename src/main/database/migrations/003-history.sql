-- Migration: 003-history
-- Description: Document history table for version tracking
-- Created: 2025-10-02

-- Document history table
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

-- Indexes for history
CREATE INDEX IF NOT EXISTS idx_history_document_id ON document_history(document_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON document_history(created_at);
