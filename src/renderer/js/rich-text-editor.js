/**
 * @file rich-text-editor.js
 * @description Rich text editor wrapper for TinyMCE
 * @module renderer/rich-text-editor
 */

/**
 * Rich Text Editor class
 * Wrapper for TinyMCE with Russian localization and custom configuration
 */
class RichTextEditor {
  /**
   * @param {Object} options - Editor options
   * @param {HTMLElement} options.element - Textarea element to convert
   * @param {Function} options.onChange - Callback when content changes
   * @param {Object} options.config - Additional TinyMCE configuration
   */
  constructor(options) {
    this.element = options.element;
    this.onChange = options.onChange || (() => {});
    this.config = options.config || {};

    /** @type {Object} TinyMCE editor instance */
    this.editor = null;

    /** @type {boolean} Editor initialization status */
    this.initialized = false;
  }

  /**
   * Initialize TinyMCE editor
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      console.warn('Editor already initialized');
      return;
    }

    // Check if TinyMCE is loaded
    if (typeof tinymce === 'undefined') {
      console.error('TinyMCE is not loaded. Please include TinyMCE script in HTML.');
      return;
    }

    try {
      const defaultConfig = this.getDefaultConfig();
      const mergedConfig = { ...defaultConfig, ...this.config };

      await tinymce.init({
        target: this.element,
        ...mergedConfig,
        setup: (editor) => {
          this.editor = editor;

          // Content change handler
          editor.on('change', () => {
            const content = editor.getContent();
            this.onChange(content);
          });

          // Blur event for autosave
          editor.on('blur', () => {
            const content = editor.getContent();
            this.onChange(content);
          });

          // Call custom setup if provided
          if (mergedConfig.setup) {
            mergedConfig.setup(editor);
          }
        }
      });

      this.initialized = true;
      console.log(`TinyMCE editor initialized for ${this.element.id}`);
    } catch (error) {
      console.error('Error initializing TinyMCE editor:', error);
      throw error;
    }
  }

  /**
   * Get default TinyMCE configuration
   * @private
   * @returns {Object} - Default configuration
   */
  getDefaultConfig() {
    return {
      // Language
      language: 'ru',

      // Skin
      skin: 'oxide',

      // Height
      height: 300,
      min_height: 200,
      max_height: 600,

      // Menubar
      menubar: false,

      // Toolbar
      toolbar: [
        'undo redo | blocks | bold italic underline strikethrough | forecolor backcolor',
        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat'
      ].join(' | '),

      // Plugins
      plugins: [
        'lists',
        'link',
        'autolink',
        'autoresize',
        'searchreplace',
        'wordcount'
      ],

      // Block formats
      block_formats: 'Параграф=p; Заголовок 1=h1; Заголовок 2=h2; Заголовок 3=h3; Заголовок 4=h4',

      // Content style
      content_style: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
          padding: 10px;
        }
        p {
          margin: 0 0 10px;
        }
        h1, h2, h3, h4 {
          margin: 15px 0 10px;
          font-weight: 600;
        }
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        h4 { font-size: 16px; }
        ul, ol {
          margin: 10px 0;
          padding-left: 30px;
        }
        li {
          margin: 5px 0;
        }
      `,

      // Autoresize
      autoresize_bottom_margin: 20,

      // Browser spell check
      browser_spellcheck: true,

      // Convert URLs
      convert_urls: false,

      // Paste settings
      paste_as_text: false,
      paste_retain_style_properties: 'font-size font-weight font-style text-decoration color',

      // Advanced settings
      entity_encoding: 'raw',
      remove_script_host: false,
      relative_urls: false,

      // Statusbar
      statusbar: true,
      elementpath: false,

      // Resize
      resize: true,

      // Promotion
      promotion: false,
      branding: false
    };
  }

  /**
   * Get editor content
   * @returns {string} - Editor content (HTML)
   */
  getContent() {
    if (this.editor) {
      return this.editor.getContent();
    }
    return this.element.value;
  }

  /**
   * Set editor content
   * @param {string} content - Content to set (HTML)
   */
  setContent(content) {
    if (this.editor) {
      this.editor.setContent(content || '');
    } else {
      this.element.value = content || '';
    }
  }

  /**
   * Get plain text content
   * @returns {string} - Plain text content
   */
  getPlainText() {
    if (this.editor) {
      return this.editor.getContent({ format: 'text' });
    }
    return this.element.value;
  }

  /**
   * Clear editor content
   */
  clear() {
    this.setContent('');
  }

  /**
   * Focus editor
   */
  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  /**
   * Check if editor is dirty (modified)
   * @returns {boolean} - True if content has been modified
   */
  isDirty() {
    if (this.editor) {
      return this.editor.isDirty();
    }
    return false;
  }

  /**
   * Set editor as clean (not modified)
   */
  setClean() {
    if (this.editor) {
      this.editor.setDirty(false);
    }
  }

  /**
   * Disable editor
   */
  disable() {
    if (this.editor) {
      this.editor.mode.set('readonly');
    }
  }

  /**
   * Enable editor
   */
  enable() {
    if (this.editor) {
      this.editor.mode.set('design');
    }
  }

  /**
   * Check if editor is enabled
   * @returns {boolean} - True if editor is enabled
   */
  isEnabled() {
    if (this.editor) {
      return this.editor.mode.get() === 'design';
    }
    return true;
  }

  /**
   * Get word count
   * @returns {number} - Word count
   */
  getWordCount() {
    if (this.editor) {
      const plugin = this.editor.plugins.wordcount;
      if (plugin) {
        return plugin.body.getWordCount();
      }
    }
    return 0;
  }

  /**
   * Get character count
   * @returns {number} - Character count
   */
  getCharacterCount() {
    if (this.editor) {
      const plugin = this.editor.plugins.wordcount;
      if (plugin) {
        return plugin.body.getCharacterCount();
      }
    }
    return this.getPlainText().length;
  }

  /**
   * Insert content at cursor position
   * @param {string} content - Content to insert
   */
  insertContent(content) {
    if (this.editor) {
      this.editor.insertContent(content);
    }
  }

  /**
   * Execute editor command
   * @param {string} command - Command name
   * @param {any} value - Command value
   */
  execCommand(command, value) {
    if (this.editor) {
      this.editor.execCommand(command, false, value);
    }
  }

  /**
   * Show editor (if hidden)
   */
  show() {
    if (this.editor) {
      this.editor.show();
    }
  }

  /**
   * Hide editor
   */
  hide() {
    if (this.editor) {
      this.editor.hide();
    }
  }

  /**
   * Destroy editor instance
   */
  destroy() {
    if (this.editor) {
      try {
        this.editor.destroy();
        this.editor = null;
        this.initialized = false;
        console.log('TinyMCE editor destroyed');
      } catch (error) {
        console.error('Error destroying TinyMCE editor:', error);
      }
    }
  }

  /**
   * Static method to check if TinyMCE is loaded
   * @returns {boolean} - True if TinyMCE is loaded
   */
  static isLoaded() {
    return typeof tinymce !== 'undefined';
  }

  /**
   * Static method to get TinyMCE version
   * @returns {string|null} - TinyMCE version or null if not loaded
   */
  static getVersion() {
    if (RichTextEditor.isLoaded()) {
      return tinymce.majorVersion + '.' + tinymce.minorVersion;
    }
    return null;
  }

  /**
   * Static method to remove all TinyMCE editors
   */
  static removeAll() {
    if (RichTextEditor.isLoaded()) {
      tinymce.remove();
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RichTextEditor;
}
