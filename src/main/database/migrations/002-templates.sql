-- Migration: 002-templates
-- Description: Templates table for document templates
-- Created: 2025-10-02

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  schema_version TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Index for templates
CREATE INDEX IF NOT EXISTS idx_templates_schema_version ON templates(schema_version);
