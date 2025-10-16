// Template: CRUD Manager for SQLite
// Usage: Replace {{Entity}}, {{table}}, {{fields}}

class {{Entity}}Manager {
  constructor(storage) {
    this.storage = storage;
    this.cache = new Map();
  }

  /**
   * Create new {{entity}}
   */
  async create(data) {
    const sql = `INSERT INTO {{table}} ({{fields}}) VALUES ({{placeholders}})`;
    const result = await this.storage.runQuery(sql, Object.values(data));
    
    const created = { id: result.lastID, ...data, createdAt: new Date().toISOString() };
    this.cache.set(created.id, created);
    
    return created;
  }

  /**
   * Get by ID
   */
  async getById(id) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    
    const result = await this.storage.getQuery(`SELECT * FROM {{table}} WHERE id = ?`, [id]);
    if (result) {
      this.cache.set(id, result);
    }
    return result;
  }

  /**
   * Get all
   */
  async getAll(filters = {}) {
    return await this.storage.allQuery(`SELECT * FROM {{table}}`, []);
  }

  /**
   * Update
   */
  async update(id, data) {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE {{table}} SET ${fields}, updatedAt = ? WHERE id = ?`;
    
    await this.storage.runQuery(sql, [
      ...Object.values(data),
      new Date().toISOString(),
      id
    ]);
    
    this.cache.delete(id);
    return this.getById(id);
  }

  /**
   * Delete
   */
  async delete(id) {
    await this.storage.runQuery(`DELETE FROM {{table}} WHERE id = ?`, [id]);
    this.cache.delete(id);
  }

  /**
   * Bulk create (with transaction)
   */
  async bulkCreate(items) {
    await this.storage.db.run('BEGIN TRANSACTION');
    try {
      const created = [];
      for (const item of items) {
        const result = await this.create(item);
        created.push(result);
      }
      await this.storage.db.run('COMMIT');
      return created;
    } catch (error) {
      await this.storage.db.run('ROLLBACK');
      throw error;
    }
  }
}

module.exports = {{Entity}}Manager;
