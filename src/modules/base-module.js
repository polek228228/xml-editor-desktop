/**
 * @file base-module.js
 * @description Base class for all modules
 * @module modules/base-module
 */

/**
 * BaseModule provides a standard interface for all application modules.
 * All modules should extend this class.
 */
class BaseModule {
  /**
   * @param {Object} metadata - Module metadata from the registry
   * @param {ModuleAPI} api - Module API instance for system access
   */
  constructor(metadata, api) {
    this.metadata = metadata;
    this.api = api;

    if (!api) {
      console.warn(`[${metadata?.name || 'BaseModule'}] No API provided - module will have limited functionality`);
    }
  }

  /**
   * Called when the module is activated.
   * Should contain initialization logic, register commands, UI components, etc.
   * @returns {Promise<void>}
   */
  async activate() {
    console.log(`[${this.metadata.name}] Activated`);
    // Implementation-specific activation logic
  }

  /**
   * Called when the module is deactivated.
   * Should contain cleanup logic, unregister commands, etc.
   * @returns {Promise<void>}
   */
  async deactivate() {
    console.log(`[${this.metadata.name}] Deactivated`);
    // Implementation-specific deactivation logic
  }

  /**
   * Get module metadata
   * @returns {Object} - Module metadata
   */
  getMetadata() {
    return this.metadata;
  }
}

module.exports = BaseModule;