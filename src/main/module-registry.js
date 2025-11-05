




/**
 *
 * @file module-registry.js
 * @description Module registry and lifecycle management
 * @module module-registry
 */

const path = require('path');
const fs = require('fs-extra');
const ModuleAPI = require('./module-api');

/**
 * ModuleRegistry manages module registration, installation, and lifecycle
 */
class ModuleRegistry {
  /**
   * @param {XMLEditorApplication} app - Main application instance
   */
  constructor(app) {
    this.app = app;
    this.storageManager = app.storage;

    /** @type {Map<string, Object>} */
    this.loadedModules = new Map();
    /** @type {Map<string, any>} */
    this.moduleInstances = new Map();

    /**
     * Module API instance - provides secure interface for modules
     * @type {ModuleAPI}
     */
    this.moduleAPI = new ModuleAPI(app);

    console.log('[ModuleRegistry] Initialized with Module API');
  }

  /**
   * Initialize registry and load installed modules
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('[ModuleRegistry] Initializing module registry...');

      // Load all installed and active modules
      const modules = await this.storageManager.listModules({
        type: 'installed'
      });

      console.log(`[ModuleRegistry] Found ${modules.length} installed modules`);

      for (const module of modules) {
        if (module.is_active) {
          await this.loadModule(module.id);
        }
      }

      console.log('[ModuleRegistry] Module registry initialized');
    } catch (error) {
      console.error('[ModuleRegistry] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Register a new module (add to database)
   * @param {Object} moduleData - Module metadata
   * @returns {Promise<void>}
   */
  async register(moduleData) {
    const {
      id, name, description, version, type, category,
      icon, price, is_featured, rating, schema_path, module_path
    } = moduleData;

    // Validate required fields
    if (!id || !name || !version || !type || !category) {
      throw new Error('Missing required module fields: id, name, version, type, category');
    }

    // Validate paths exist
    if (schema_path && !await fs.pathExists(schema_path)) {
      throw new Error(`Schema file not found: ${schema_path}`);
    }

    if (module_path && !await fs.pathExists(module_path)) {
      throw new Error(`Module entry point not found: ${module_path}`);
    }

    // Register in database
    await this.storageManager.registerModule({
      id,
      name,
      description: description || '',
      version,
      type,
      category,
      icon: icon || 'file-text',
      price: price || 0,
      is_installed: false,
      is_active: false,
      is_featured: is_featured || false,
      rating: rating || 0,
      downloads: 0,
      schema_path,
      module_path
    });

    console.log(`[ModuleRegistry] Registered module: ${id} (${name})`);
  }

  /**
   * Install a module (set is_installed = true)
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   */
  async install(moduleId) {
    const module = await this.storageManager.getModule(moduleId);

    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    if (module.is_installed) {
      console.log(`[ModuleRegistry] Module already installed: ${moduleId}`);
      return;
    }

    // Mark as installed in database
    await this.storageManager.installModule(moduleId);

    console.log(`[ModuleRegistry] Installed module: ${moduleId}`);
  }

  /**
   * Uninstall a module (set is_installed = false, is_active = false)
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   */
  async uninstall(moduleId) {
    const module = await this.storageManager.getModule(moduleId);

    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    if (!module.is_installed) {
      console.log(`[ModuleRegistry] Module not installed: ${moduleId}`);
      return;
    }

    // Deactivate first if active
    if (module.is_active) {
      await this.deactivate(moduleId);
    }

    // Uninstall from database
    await this.storageManager.uninstallModule(moduleId);

    console.log(`[ModuleRegistry] Uninstalled module: ${moduleId}`);
  }

  /**
   * Activate a module (load into memory)
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   */
  async activate(moduleId) {
    const module = await this.storageManager.getModule(moduleId);

    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    if (!module.is_installed) {
      throw new Error(`Module not installed: ${moduleId}`);
    }

    if (module.is_active) {
      console.log(`[ModuleRegistry] Module already active: ${moduleId}`);
      return;
    }

    // Load module into memory
    await this.loadModule(moduleId);

    // Mark as active in database
    await this.storageManager.activateModule(moduleId);

    console.log(`[ModuleRegistry] Activated module: ${moduleId}`);
  }

  /**
   * Deactivate a module (unload from memory)
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   */
  async deactivate(moduleId) {
    const module = await this.storageManager.getModule(moduleId);

    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    if (!module.is_active) {
      console.log(`[ModuleRegistry] Module not active: ${moduleId}`);
      return;
    }

    // Unload module from memory
    await this.unloadModule(moduleId);

    // Mark as inactive in database
    await this.storageManager.deactivateModule(moduleId);

    console.log(`[ModuleRegistry] Deactivated module: ${moduleId}`);
  }

  /**
   * Load module into memory (internal)
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   * @private
   */
  async loadModule(moduleId) {
    const module = await this.storageManager.getModule(moduleId);

    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    // Skip if already loaded
    if (this.loadedModules.has(moduleId)) {
      console.log(`[ModuleRegistry] Module already loaded: ${moduleId}`);
      return;
    }

    try {
      // Load module metadata
      const moduleMetadata = {
        id: module.id,
        name: module.name,
        description: module.description,
        version: module.version,
        type: module.type,
        category: module.category,
        schema_path: module.schema_path,
        module_path: module.module_path
      };

      this.loadedModules.set(moduleId, moduleMetadata);

      // If module has entry point, load it
      if (module.module_path && await fs.pathExists(module.module_path)) {
        const ModuleClass = require(module.module_path);

        // Create module instance with API access
        const instance = new ModuleClass(moduleMetadata, this.moduleAPI);

        // Call activate() lifecycle hook
        if (typeof instance.activate === 'function') {
          await instance.activate();
        }

        this.moduleInstances.set(moduleId, instance);
      }

      console.log(`[ModuleRegistry] Loaded module: ${moduleId}`);
    } catch (error) {
      console.error(`[ModuleRegistry] Failed to load module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Unload module from memory (internal)
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   * @private
   */
  async unloadModule(moduleId) {
    if (!this.loadedModules.has(moduleId)) {
      return;
    }

    try {
      const instance = this.moduleInstances.get(moduleId);

      if (instance) {
        // Call deactivate() lifecycle hook
        if (typeof instance.deactivate === 'function') {
          await instance.deactivate();
        }

        // Legacy: Call destroy if module has it
        if (typeof instance.destroy === 'function') {
          await instance.destroy();
        }
      }

      this.moduleInstances.delete(moduleId);
      this.loadedModules.delete(moduleId);

      console.log(`[ModuleRegistry] Unloaded module: ${moduleId}`);
    } catch (error) {
      console.error(`[ModuleRegistry] Failed to unload module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Get module instance
   * @param {string} moduleId - Module ID
   * @returns {any|null} - Module instance or null
   */
  getModuleInstance(moduleId) {
    return this.moduleInstances.get(moduleId) || null;
  }

  /**
   * Get module metadata
   * @param {string} moduleId - Module ID
   * @returns {Object|null} - Module metadata or null
   */
  getModuleMetadata(moduleId) {
    return this.loadedModules.get(moduleId) || null;
  }

  /**
   * List all modules from database
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of modules
   */
  async list(options = {}) {
    return await this.storageManager.listModules(options);
  }

  /**
   * Get module by ID from database
   * @param {string} moduleId - Module ID
   * @returns {Promise<Object|undefined>} - Module or undefined
   */
  async get(moduleId) {
    return await this.storageManager.getModule(moduleId);
  }

  /**
   * Update module metadata
   * @param {string} moduleId - Module ID
   * @param {Object} data - Fields to update
   * @returns {Promise<void>}
   */
  async update(moduleId, data) {
    await this.storageManager.updateModule(moduleId, data);
    console.log(`[ModuleRegistry] Updated module: ${moduleId}`);
  }

  /**
   * Delete module from registry
   * @param {string} moduleId - Module ID
   * @returns {Promise<void>}
   */
  async delete(moduleId) {
    // Deactivate first if active
    const module = await this.get(moduleId);
    if (module && module.is_active) {
      await this.deactivate(moduleId);
    }

    await this.storageManager.deleteModule(moduleId);
    console.log(`[ModuleRegistry] Deleted module: ${moduleId}`);
  }

  /**
   * Get module statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async getStatistics() {
    return await this.storageManager.getModuleStatistics();
  }

  /**
   * Seed default modules (for initial setup)
   * @returns {Promise<void>}
   */
  async seedDefaultModules() {
    const catalogPath = path.join(__dirname, '../data/service-catalog.json');
    if (!await fs.pathExists(catalogPath)) {
      console.warn('[ModuleRegistry] Service catalog not found. Skipping seeding.');
      return;
    }

    const defaultModules = await fs.readJson(catalogPath);

    for (const moduleData of defaultModules) {
      try {
        const existing = await this.get(moduleData.id);
        if (!existing) {
          const absoluteModuleData = {
            ...moduleData,
            schema_path: moduleData.schema_path ? path.resolve(__dirname, '..', moduleData.schema_path) : null,
            module_path: moduleData.module_path ? path.resolve(__dirname, '..', moduleData.module_path) : null,
          };

          await this.register(absoluteModuleData);
        }
      } catch (error) {
        console.error(`[ModuleRegistry] Failed to seed module ${moduleData.id}:`, error);
      }
    }

    console.log('[ModuleRegistry] Default modules seeded successfully.');
  }
}

module.exports = ModuleRegistry;
