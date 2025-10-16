/**
 * @file storage-manager.js
 * @description SQLite database manager for XML Editor Desktop
 * @module storage-manager
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

/**
 * Storage Manager class for handling all database operations
 * Uses SQLite3 with automatic migrations
 */
class StorageManager {
  /**
   * @param {string} dbPath - Path to SQLite database file
   */
  constructor(dbPath) {
    this.dbPath = dbPath;
    /** @type {sqlite3.Database|null} */
    this.db = null;
  }

  /**
   * Initialize database and run migrations
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await fs.ensureDir(path.dirname(this.dbPath));

      this.db = await this.openDatabase();
      await this.runMigrations();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Open database connection
   * @returns {Promise<sqlite3.Database>}
   * @private
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) reject(err);
            else resolve(db);
          });
        }
      });
    });
  }

  /**
   * Run database migrations
   * @returns {Promise<void>}
   * @private
   */
  async runMigrations() {
    // Create migrations table if not exists
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL
      )
    `);

    const migrations = [
      {
        name: '001-initial',
        sql: `
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

          CREATE TABLE IF NOT EXISTS autosaves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
          );

          CREATE INDEX IF NOT EXISTS idx_autosaves_document_id ON autosaves(document_id);
          CREATE INDEX IF NOT EXISTS idx_autosaves_created_at ON autosaves(created_at);

          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
        `
      },
      {
        name: '002-templates',
        sql: `
          CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            schema_version TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_templates_schema_version ON templates(schema_version);
        `
      },
      {
        name: '003-history',
        sql: `
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
        `
      },
      {
        name: '004-modules',
        sql: `
          CREATE TABLE IF NOT EXISTS modules (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            version TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('document', 'form', 'tool', 'integration')),
            category TEXT NOT NULL,
            icon TEXT,
            price REAL DEFAULT 0,
            is_installed INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 0,
            is_featured INTEGER DEFAULT 0,
            rating REAL DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
            downloads INTEGER DEFAULT 0,
            schema_path TEXT,
            module_path TEXT,
            manifest TEXT,
            created_at TEXT NOT NULL,
            installed_at TEXT,
            updated_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_modules_type ON modules(type);
          CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
          CREATE INDEX IF NOT EXISTS idx_modules_installed ON modules(is_installed);
          CREATE INDEX IF NOT EXISTS idx_modules_active ON modules(is_active);
          CREATE INDEX IF NOT EXISTS idx_modules_featured ON modules(is_featured);
        `
      }
    ];

    for (const migration of migrations) {
      const exists = await this.getQuery(
        'SELECT name FROM migrations WHERE name = ?',
        [migration.name]
      );

      if (!exists) {
        console.log(`Running migration: ${migration.name}`);

        // Split SQL by semicolons and execute each statement
        const statements = migration.sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          await this.runQuery(statement);
        }

        await this.runQuery(
          'INSERT INTO migrations (name, executed_at) VALUES (?, ?)',
          [migration.name, new Date().toISOString()]
        );

        console.log(`Migration completed: ${migration.name}`);
      }
    }
  }

  /**
   * Execute a query that returns multiple rows
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute a query that returns a single row
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|undefined>}
   */
  getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute a query that modifies data (INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object>} - Object with lastID and changes properties
   */
  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // ==================== DOCUMENTS OPERATIONS ====================

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {string} data.title - Document title
   * @param {string} data.schema_version - Schema version (01.03, 01.04, 01.05)
   * @param {string} data.content - JSON content
   * @param {string} data.created_at - Creation timestamp
   * @param {string} data.updated_at - Update timestamp
   * @returns {Promise<number>} - New document ID
   */
  async createDocument(data) {
    const { title, schema_version, content, created_at, updated_at } = data;

    const result = await this.runQuery(
      `INSERT INTO documents (title, schema_version, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [title, schema_version, content, created_at, updated_at]
    );

    return result.lastID;
  }

  /**
   * Get document by ID
   * @param {number} id - Document ID
   * @returns {Promise<Object|undefined>} - Document or undefined
   */
  async getDocument(id) {
    return await this.getQuery(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );
  }

  /**
   * Update document
   * @param {number} id - Document ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  async updateDocument(id, data) {
    const fields = [];
    const values = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    if (data.xml_content !== undefined) {
      fields.push('xml_content = ?');
      values.push(data.xml_content);
    }
    if (data.is_valid !== undefined) {
      fields.push('is_valid = ?');
      values.push(data.is_valid ? 1 : 0);
    }
    if (data.updated_at !== undefined) {
      fields.push('updated_at = ?');
      values.push(data.updated_at);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    await this.runQuery(
      `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete document
   * @param {number} id - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(id) {
    await this.runQuery('DELETE FROM documents WHERE id = ?', [id]);
  }

  /**
   * List all documents
   * @param {Object} options - Query options
   * @param {string} options.orderBy - Order by field (default: updated_at)
   * @param {string} options.order - Order direction (ASC or DESC, default: DESC)
   * @param {number} options.limit - Limit number of results
   * @returns {Promise<Array>} - Array of documents
   */
  async listDocuments(options = {}) {
    const { orderBy = 'updated_at', order = 'DESC', limit } = options;

    let sql = `SELECT id, title, schema_version, created_at, updated_at, is_valid
               FROM documents
               ORDER BY ${orderBy} ${order}`;

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    return await this.allQuery(sql);
  }

  // ==================== AUTOSAVES OPERATIONS ====================

  /**
   * Create autosave
   * @param {Object} data - Autosave data
   * @param {number} data.document_id - Document ID
   * @param {string} data.content - JSON content
   * @param {string} data.created_at - Creation timestamp
   * @returns {Promise<number>} - New autosave ID
   */
  async createAutosave(data) {
    const { document_id, content, created_at } = data;

    // Keep only last 10 autosaves per document
    const autosaves = await this.allQuery(
      `SELECT id FROM autosaves
       WHERE document_id = ?
       ORDER BY created_at DESC`,
      [document_id]
    );

    if (autosaves.length >= 10) {
      const toDelete = autosaves.slice(9).map(a => a.id);
      await this.runQuery(
        `DELETE FROM autosaves WHERE id IN (${toDelete.join(',')})`,
        []
      );
    }

    const result = await this.runQuery(
      'INSERT INTO autosaves (document_id, content, created_at) VALUES (?, ?, ?)',
      [document_id, content, created_at]
    );

    return result.lastID;
  }

  /**
   * Get latest autosave for document
   * @param {number} documentId - Document ID
   * @returns {Promise<Object|undefined>} - Latest autosave or undefined
   */
  async getLatestAutosave(documentId) {
    return await this.getQuery(
      `SELECT * FROM autosaves
       WHERE document_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [documentId]
    );
  }

  /**
   * List autosaves for document
   * @param {number} documentId - Document ID
   * @returns {Promise<Array>} - Array of autosaves
   */
  async listAutosaves(documentId) {
    return await this.allQuery(
      `SELECT * FROM autosaves
       WHERE document_id = ?
       ORDER BY created_at DESC`,
      [documentId]
    );
  }

  // ==================== SETTINGS OPERATIONS ====================

  /**
   * Get setting by key
   * @param {string} key - Setting key
   * @returns {Promise<Object|undefined>} - Setting object or undefined
   */
  async getSetting(key) {
    return await this.getQuery(
      'SELECT * FROM settings WHERE key = ?',
      [key]
    );
  }

  /**
   * Set setting value
   * @param {string} key - Setting key
   * @param {string} value - Setting value
   * @returns {Promise<void>}
   */
  async setSetting(key, value) {
    const exists = await this.getSetting(key);

    if (exists) {
      await this.runQuery(
        'UPDATE settings SET value = ?, updated_at = ? WHERE key = ?',
        [value, new Date().toISOString(), key]
      );
    } else {
      await this.runQuery(
        'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)',
        [key, value, new Date().toISOString()]
      );
    }
  }

  /**
   * Delete setting
   * @param {string} key - Setting key
   * @returns {Promise<void>}
   */
  async deleteSetting(key) {
    await this.runQuery('DELETE FROM settings WHERE key = ?', [key]);
  }

  // ==================== TEMPLATES OPERATIONS ====================

  /**
   * Create template
   * @param {Object} data - Template data
   * @param {string} data.name - Template name
   * @param {string} data.description - Template description
   * @param {string} data.schema_version - Schema version
   * @param {string} data.content - JSON content
   * @param {string} data.created_at - Creation timestamp
   * @returns {Promise<number>} - New template ID
   */
  async createTemplate(data) {
    const { name, description, schema_version, content, created_at } = data;

    const result = await this.runQuery(
      `INSERT INTO templates (name, description, schema_version, content, template_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, schema_version, content, content, created_at]
    );

    return result.lastID;
  }

  /**
   * Get template by ID
   * @param {number} id - Template ID
   * @returns {Promise<Object|undefined>} - Template or undefined
   */
  async getTemplate(id) {
    return await this.getQuery(
      'SELECT * FROM templates WHERE id = ?',
      [id]
    );
  }

  /**
   * Update template
   * @param {number} id - Template ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  async updateTemplate(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);

    await this.runQuery(
      `UPDATE templates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete template
   * @param {number} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    await this.runQuery('DELETE FROM templates WHERE id = ?', [id]);
  }

  /**
   * List templates
   * @param {Object} options - Query options
   * @param {string} options.schema_version - Filter by schema version
   * @returns {Promise<Array>} - Array of templates
   */
  async listTemplates(options = {}) {
    const { schema_version } = options;

    let sql = 'SELECT * FROM templates';
    const params = [];

    if (schema_version) {
      sql += ' WHERE schema_version = ?';
      params.push(schema_version);
    }

    sql += ' ORDER BY created_at DESC';

    return await this.allQuery(sql, params);
  }

  // ==================== HISTORY OPERATIONS ====================

  /**
   * Create history entry
   * @param {Object} data - History data
   * @returns {Promise<number>} - New history entry ID
   */
  async createHistoryEntry(data) {
    const { document_id, title, content, xml_content, is_valid, created_at } = data;

    const result = await this.runQuery(
      `INSERT INTO document_history (document_id, title, content, xml_content, is_valid, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [document_id, title, content, xml_content, is_valid ? 1 : 0, created_at]
    );

    return result.lastID;
  }

  /**
   * List history for document
   * @param {number} documentId - Document ID
   * @param {number} limit - Limit number of entries (default: 20)
   * @returns {Promise<Array>} - Array of history entries
   */
  async listHistory(documentId, limit = 20) {
    return await this.allQuery(
      `SELECT * FROM document_history
       WHERE document_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [documentId, limit]
    );
  }

  // ==================== MODULES OPERATIONS ====================

  /**
   * Register a module in the database
   * @param {Object} data - Module data
   * @param {string} data.id - Unique module ID (e.g., 'pz-01.05')
   * @param {string} data.name - Display name
   * @param {string} data.description - Module description
   * @param {string} data.version - Version string (e.g., '1.0.0')
   * @param {string} data.type - Module type ('document', 'utility', 'integration')
   * @param {string} data.category - Category ('Documents', 'Utilities', 'Integrations')
   * @param {string} data.icon - Icon name or path
   * @param {number} data.price - Price in RUB (0 for free)
   * @param {boolean} data.is_installed - Installation status
   * @param {boolean} data.is_active - Activation status
   * @param {boolean} data.is_featured - Featured module
   * @param {number} data.rating - Rating 0-5
   * @param {number} data.downloads - Download count
   * @param {string} data.schema_path - Path to JSON schema file
   * @param {string} data.module_path - Path to module entry point
   * @returns {Promise<void>}
   */
  async registerModule(data) {
    const {
      id, name, description, version, type, category, icon,
      price = 0, is_installed = false, is_active = false,
      is_featured = false, rating = 0, downloads = 0,
      schema_path, module_path
    } = data;

    const now = new Date().toISOString();

    await this.runQuery(
      `INSERT OR REPLACE INTO modules (
        id, name, description, version, type, category, icon,
        price, is_installed, is_active, is_featured, rating, downloads,
        schema_path, module_path, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, description, version, type, category, icon,
        price, is_installed ? 1 : 0, is_active ? 1 : 0,
        is_featured ? 1 : 0, rating, downloads,
        schema_path, module_path, now, now
      ]
    );
  }

  /**
   * Get module by ID
   * @param {string} id - Module ID
   * @returns {Promise<Object|undefined>} - Module or undefined
   */
  async getModule(id) {
    return await this.getQuery(
      'SELECT * FROM modules WHERE id = ?',
      [id]
    );
  }

  /**
   * List all modules
   * @param {Object} options - Query options
   * @param {string} options.type - Filter by type ('all', 'installed', 'available')
   * @param {string} options.category - Filter by category
   * @param {boolean} options.featured_only - Show only featured modules
   * @returns {Promise<Array>} - Array of modules
   */
  async listModules(options = {}) {
    const { type = 'all', category, featured_only = false } = options;

    let sql = 'SELECT * FROM modules WHERE 1=1';
    const params = [];

    if (type === 'installed') {
      sql += ' AND is_installed = 1';
    } else if (type === 'available') {
      sql += ' AND is_installed = 0';
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (featured_only) {
      sql += ' AND is_featured = 1';
    }

    sql += ' ORDER BY is_featured DESC, rating DESC, name ASC';

    return await this.allQuery(sql, params);
  }

  /**
   * Install module (set is_installed = 1)
   * @param {string} id - Module ID
   * @returns {Promise<void>}
   */
  async installModule(id) {
    const now = new Date().toISOString();

    await this.runQuery(
      'UPDATE modules SET is_installed = 1, installed_at = ?, updated_at = ? WHERE id = ?',
      [now, now, id]
    );
  }

  /**
   * Uninstall module (set is_installed = 0, is_active = 0)
   * @param {string} id - Module ID
   * @returns {Promise<void>}
   */
  async uninstallModule(id) {
    const now = new Date().toISOString();

    await this.runQuery(
      'UPDATE modules SET is_installed = 0, is_active = 0, installed_at = NULL, updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  /**
   * Activate module (set is_active = 1)
   * @param {string} id - Module ID
   * @returns {Promise<void>}
   */
  async activateModule(id) {
    const now = new Date().toISOString();

    await this.runQuery(
      'UPDATE modules SET is_active = 1, updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  /**
   * Deactivate module (set is_active = 0)
   * @param {string} id - Module ID
   * @returns {Promise<void>}
   */
  async deactivateModule(id) {
    const now = new Date().toISOString();

    await this.runQuery(
      'UPDATE modules SET is_active = 0, updated_at = ? WHERE id = ?',
      [now, id]
    );
  }

  /**
   * Update module metadata
   * @param {string} id - Module ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  async updateModule(id, data) {
    const fields = [];
    const values = [];

    const allowedFields = [
      'name', 'description', 'version', 'icon', 'price',
      'rating', 'downloads', 'is_featured', 'schema_path', 'module_path'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (fields.length === 0) {
      return;
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await this.runQuery(
      `UPDATE modules SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Delete module from registry
   * @param {string} id - Module ID
   * @returns {Promise<void>}
   */
  async deleteModule(id) {
    await this.runQuery('DELETE FROM modules WHERE id = ?', [id]);
  }

  /**
   * Get statistics about modules
   * @returns {Promise<Object>} - Statistics object
   */
  async getModuleStatistics() {
    const total = await this.getQuery('SELECT COUNT(*) as count FROM modules');
    const installed = await this.getQuery('SELECT COUNT(*) as count FROM modules WHERE is_installed = 1');
    const active = await this.getQuery('SELECT COUNT(*) as count FROM modules WHERE is_active = 1');
    const featured = await this.getQuery('SELECT COUNT(*) as count FROM modules WHERE is_featured = 1');

    return {
      total: total?.count || 0,
      installed: installed?.count || 0,
      active: active?.count || 0,
      featured: featured?.count || 0
    };
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = StorageManager;
