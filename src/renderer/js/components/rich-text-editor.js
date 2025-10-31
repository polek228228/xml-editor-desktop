/**
 * @file rich-text-editor.js
 * @description Rich Text Editor component using TinyMCE
 * @module components/rich-text-editor
 */

/**
 * RichTextEditor - WYSIWYG editor component for rich text fields
 *
 * Features:
 * - TinyMCE integration
 * - Customizable toolbar
 * - HTML output
 * - Auto-save support
 * - Validation support
 */
class RichTextEditor {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.id - Unique ID for the editor
   * @param {HTMLElement} config.container - Container element
   * @param {string} [config.value] - Initial HTML value
   * @param {Function} [config.onChange] - Change callback
   * @param {Object} [config.options] - TinyMCE options override
   */
  constructor(config) {
    this.id = config.id || `tinymce-${Date.now()}`;
    this.container = config.container;
    this.value = config.value || '';
    this.onChange = config.onChange || (() => {});
    this.options = config.options || {};

    /**
     * TinyMCE editor instance
     * @type {Object|null}
     */
    this.editor = null;

    /**
     * Textarea element
     * @type {HTMLTextAreaElement|null}
     */
    this.textarea = null;

    console.log('[RichTextEditor] Initialized:', this.id);
  }

  /**
   * Render the editor
   * @returns {HTMLElement} - Editor container element
   */
  render() {
    // Create textarea element
    this.textarea = document.createElement('textarea');
    this.textarea.id = this.id;
    this.textarea.className = 'richtext-editor__textarea';
    this.textarea.value = this.value;

    // Wrap in container
    const wrapper = document.createElement('div');
    wrapper.className = 'richtext-editor';
    wrapper.appendChild(this.textarea);

    if (this.container) {
      this.container.appendChild(wrapper);
    }

    // Initialize TinyMCE after a short delay to ensure DOM is ready
    setTimeout(() => this.init(), 100);

    return wrapper;
  }

  /**
   * Initialize TinyMCE editor
   * @private
   */
  async init() {
    try {
      // Check if TinyMCE is loaded
      if (typeof tinymce === 'undefined') {
        console.error('[RichTextEditor] TinyMCE not loaded');
        return;
      }

      // Default TinyMCE configuration
      const defaultConfig = {
        selector: `#${this.id}`,
        height: 400,
        menubar: false,
        language: 'ru',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
          'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
          'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic underline | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | removeformat | table | help',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; }',
        setup: (editor) => {
          // Store editor instance
          this.editor = editor;

          // Handle content changes
          editor.on('change', () => {
            const content = editor.getContent();
            this.value = content;
            this.onChange(content);
          });

          // Handle blur (for autosave)
          editor.on('blur', () => {
            const content = editor.getContent();
            this.value = content;
            this.onChange(content);
          });

          console.log(`[RichTextEditor] TinyMCE initialized: ${this.id}`);
        }
      };

      // Merge with custom options
      const config = { ...defaultConfig, ...this.options };

      // Initialize TinyMCE
      await tinymce.init(config);

    } catch (error) {
      console.error('[RichTextEditor] Failed to initialize TinyMCE:', error);
    }
  }

  /**
   * Get current HTML content
   * @returns {string} - HTML content
   */
  getValue() {
    if (this.editor) {
      return this.editor.getContent();
    }
    return this.value;
  }

  /**
   * Set HTML content
   * @param {string} value - HTML content
   */
  setValue(value) {
    this.value = value;

    if (this.editor) {
      this.editor.setContent(value);
    } else if (this.textarea) {
      this.textarea.value = value;
    }
  }

  /**
   * Get plain text content (without HTML tags)
   * @returns {string} - Plain text
   */
  getPlainText() {
    if (this.editor) {
      return this.editor.getContent({ format: 'text' });
    }

    // Fallback: strip HTML tags manually
    const div = document.createElement('div');
    div.innerHTML = this.value;
    return div.textContent || div.innerText || '';
  }

  /**
   * Check if editor has content
   * @returns {boolean}
   */
  isEmpty() {
    const text = this.getPlainText().trim();
    return text.length === 0;
  }

  /**
   * Set focus on editor
   */
  focus() {
    if (this.editor) {
      this.editor.focus();
    } else if (this.textarea) {
      this.textarea.focus();
    }
  }

  /**
   * Enable/disable editor
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    if (this.editor) {
      this.editor.mode.set(enabled ? 'design' : 'readonly');
    } else if (this.textarea) {
      this.textarea.disabled = !enabled;
    }
  }

  /**
   * Destroy editor instance
   */
  destroy() {
    if (this.editor) {
      try {
        tinymce.remove(`#${this.id}`);
        this.editor = null;
        console.log(`[RichTextEditor] Destroyed: ${this.id}`);
      } catch (error) {
        console.error('[RichTextEditor] Error destroying editor:', error);
      }
    }
  }

  /**
   * Convert HTML to plain XML text (strip HTML tags)
   * Useful for XML export when HTML formatting is not needed
   *
   * @param {string} html - HTML content
   * @returns {string} - Plain text for XML
   */
  static htmlToXmlText(html) {
    if (!html) return '';

    // Create temporary div to parse HTML
    const div = document.createElement('div');
    div.innerHTML = html;

    // Replace <br> with newlines
    const brs = div.querySelectorAll('br');
    brs.forEach(br => {
      br.replaceWith('\n');
    });

    // Replace </p> with double newlines
    const ps = div.querySelectorAll('p');
    ps.forEach(p => {
      const text = p.textContent;
      p.replaceWith(text + '\n\n');
    });

    // Get plain text
    let text = div.textContent || div.innerText || '';

    // Clean up extra whitespace
    text = text.trim();
    text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines

    return text;
  }

  /**
   * Convert HTML to formatted XML (preserve some formatting)
   * Converts HTML tags to XML-safe format
   *
   * @param {string} html - HTML content
   * @returns {string} - XML-formatted text
   */
  static htmlToXmlFormatted(html) {
    if (!html) return '';

    let text = html;

    // Replace HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');

    // Convert basic formatting to XML-safe format
    text = text.replace(/<strong>(.*?)<\/strong>/g, '**$1**'); // Bold
    text = text.replace(/<b>(.*?)<\/b>/g, '**$1**'); // Bold
    text = text.replace(/<em>(.*?)<\/em>/g, '*$1*'); // Italic
    text = text.replace(/<i>(.*?)<\/i>/g, '*$1*'); // Italic
    text = text.replace(/<u>(.*?)<\/u>/g, '_$1_'); // Underline

    // Remove all other HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Clean up whitespace
    text = text.trim();

    return text;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RichTextEditor;
}

if (typeof window !== 'undefined') {
  window.RichTextEditor = RichTextEditor;
}
