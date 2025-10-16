/**
 * @file accordion.js
 * @description Accordion component for collapsible sections
 * @module components/accordion
 */

/**
 * Accordion component class
 * Creates collapsible sections with smooth animations
 */
class Accordion {
  /**
   * @param {Object} options - Accordion options
   * @param {string} options.id - Unique accordion ID
   * @param {string} options.title - Accordion title
   * @param {string} options.content - HTML content for accordion body
   * @param {boolean} options.isOpen - Initial open state (default: false)
   * @param {Function} options.onToggle - Callback when accordion is toggled
   */
  constructor(options) {
    this.id = options.id;
    this.title = options.title;
    this.content = options.content;
    this.isOpen = options.isOpen || false;
    this.onToggle = options.onToggle || (() => {});

    this.element = null;
    this.headerElement = null;
    this.contentElement = null;

    this.render();
  }

  /**
   * Render accordion HTML
   * @private
   */
  render() {
    const accordionHTML = `
      <div class="accordion ${this.isOpen ? 'accordion--open' : ''}" data-accordion-id="${this.id}">
        <div class="accordion__header" role="button" tabindex="0" aria-expanded="${this.isOpen}">
          <h3 class="accordion__title">${this.title}</h3>
          <span class="accordion__icon">▼</span>
        </div>
        <div class="accordion__content">
          <div class="accordion__body">
            ${this.content}
          </div>
        </div>
      </div>
    `;

    const template = document.createElement('div');
    template.innerHTML = accordionHTML.trim();
    this.element = template.firstChild;

    this.headerElement = this.element.querySelector('.accordion__header');
    this.contentElement = this.element.querySelector('.accordion__content');

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    // Click event
    this.headerElement.addEventListener('click', () => {
      this.toggle();
    });

    // Keyboard support
    this.headerElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Toggle accordion open/close state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open accordion
   */
  open() {
    this.isOpen = true;
    this.element.classList.add('accordion--open');
    this.headerElement.setAttribute('aria-expanded', 'true');
    this.onToggle(this.id, true);
  }

  /**
   * Close accordion
   */
  close() {
    this.isOpen = false;
    this.element.classList.remove('accordion--open');
    this.headerElement.setAttribute('aria-expanded', 'false');
    this.onToggle(this.id, false);
  }

  /**
   * Update accordion content
   * @param {string} content - New HTML content
   */
  updateContent(content) {
    this.content = content;
    const bodyElement = this.element.querySelector('.accordion__body');
    if (bodyElement) {
      bodyElement.innerHTML = content;
    }
  }

  /**
   * Get accordion DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroy accordion and remove event listeners
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.headerElement = null;
    this.contentElement = null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Accordion;
}
