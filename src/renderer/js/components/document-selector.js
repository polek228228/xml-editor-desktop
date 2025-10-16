/**
 * @file document-selector.js
 * @description Document selector dialog component
 * @module renderer/components/document-selector
 */

/**
 * Document selector dialog for choosing documents to open
 * Provides search functionality and keyboard navigation
 */
class DocumentSelector {
  /**
   * Create a document selector
   * @param {Object} options - Configuration options
   * @param {Array} options.documents - Array of document objects
   * @param {Function} options.onSelect - Callback when document is selected (documentId)
   * @param {Function} options.onCancel - Callback when dialog is cancelled
   */
  constructor(options = {}) {
    this.documents = options.documents || [];
    this.onSelect = options.onSelect || (() => {});
    this.onCancel = options.onCancel || (() => {});

    this.overlay = null;
    this.dialog = null;
    this.searchInput = null;
    this.listContainer = null;
    this.filteredDocuments = [...this.documents];
    this.selectedIndex = 0;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * Create and show the dialog
   */
  show() {
    this.render();

    // Focus search input after animation
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.focus();
      }
    }, 100);
  }

  /**
   * Hide and destroy the dialog
   */
  hide() {
    this.removeEventListeners();

    if (this.overlay) {
      this.overlay.classList.add('modal-overlay--hiding');

      setTimeout(() => {
        this.destroy();
      }, 200);
    }
  }

  /**
   * Create dialog HTML structure
   * @private
   */
  render() {
    // Create overlay
    this.overlay = window.document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.addEventListener('click', this.handleClickOutside);

    // Create dialog
    this.dialog = window.document.createElement('div');
    this.dialog.className = 'document-selector';

    // Stop propagation on dialog clicks
    this.dialog.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = this.createHeader();

    // Search
    const search = this.createSearch();

    // Document list
    const list = this.createList();

    // Footer
    const footer = this.createFooter();

    // Assemble dialog
    this.dialog.appendChild(header);
    this.dialog.appendChild(search);
    this.dialog.appendChild(list);
    this.dialog.appendChild(footer);

    this.overlay.appendChild(this.dialog);
    window.document.body.appendChild(this.overlay);

    // Add event listeners
    this.addEventListeners();

    // Trigger animation
    requestAnimationFrame(() => {
      this.overlay.classList.add('modal-overlay--visible');
    });
  }

  /**
   * Create header section
   * @private
   * @returns {HTMLElement}
   */
  createHeader() {
    const header = window.document.createElement('div');
    header.className = 'document-selector__header';

    const title = window.document.createElement('h2');
    title.className = 'document-selector__title';
    title.textContent = 'Выберите документ';

    const closeBtn = window.document.createElement('button');
    closeBtn.className = 'document-selector__close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Закрыть');
    closeBtn.addEventListener('click', () => this.handleCancel());

    header.appendChild(title);
    header.appendChild(closeBtn);

    return header;
  }

  /**
   * Create search section
   * @private
   * @returns {HTMLElement}
   */
  createSearch() {
    const searchWrapper = window.document.createElement('div');
    searchWrapper.className = 'document-selector__search';

    this.searchInput = window.document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.className = 'document-selector__search-input';
    this.searchInput.placeholder = 'Поиск по названию...';
    this.searchInput.addEventListener('input', this.handleSearch);

    searchWrapper.appendChild(this.searchInput);

    return searchWrapper;
  }

  /**
   * Create document list section
   * @private
   * @returns {HTMLElement}
   */
  createList() {
    this.listContainer = window.document.createElement('div');
    this.listContainer.className = 'document-selector__list';

    this.renderList();

    return this.listContainer;
  }

  /**
   * Render document list items
   * @private
   */
  renderList() {
    if (!this.listContainer) return;

    this.listContainer.innerHTML = '';

    if (this.filteredDocuments.length === 0) {
      const empty = window.document.createElement('div');
      empty.className = 'document-selector__empty';
      empty.textContent = 'Нет документов';
      this.listContainer.appendChild(empty);
      return;
    }

    this.filteredDocuments.forEach((doc, index) => {
      const item = this.createListItem(doc, index);
      this.listContainer.appendChild(item);
    });

    // Select first item
    this.updateSelection(0);
  }

  /**
   * Create a single document list item
   * @private
   * @param {Object} doc - Document object
   * @param {number} index - Item index
   * @returns {HTMLElement}
   */
  createListItem(doc, index) {
    const item = window.document.createElement('div');
    item.className = 'document-selector__item';
    item.dataset.index = index;
    item.dataset.documentId = doc.id;

    // Title
    const title = window.document.createElement('div');
    title.className = 'document-selector__item-title';
    title.textContent = doc.title || 'Без названия';

    // Meta information
    const meta = window.document.createElement('div');
    meta.className = 'document-selector__item-meta';

    // Schema version
    const schema = window.document.createElement('span');
    schema.className = 'document-selector__item-schema';
    schema.textContent = `Схема: ${doc.schema_version || '—'}`;

    // Last updated
    const updated = window.document.createElement('span');
    updated.className = 'document-selector__item-date';
    updated.textContent = this.formatDate(doc.updated_at);

    meta.appendChild(schema);
    meta.appendChild(updated);

    item.appendChild(title);
    item.appendChild(meta);

    // Click handler
    item.addEventListener('click', () => this.handleSelect(doc.id));

    // Hover handler
    item.addEventListener('mouseenter', () => this.updateSelection(index));

    return item;
  }

  /**
   * Create footer section
   * @private
   * @returns {HTMLElement}
   */
  createFooter() {
    const footer = window.document.createElement('div');
    footer.className = 'document-selector__footer';

    const cancelBtn = window.document.createElement('button');
    cancelBtn.className = 'btn btn--secondary';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', () => this.handleCancel());

    footer.appendChild(cancelBtn);

    return footer;
  }

  /**
   * Add event listeners
   * @private
   */
  addEventListeners() {
    window.document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Remove event listeners
   * @private
   */
  removeEventListeners() {
    window.document.removeEventListener('keydown', this.handleKeyDown);
    if (this.overlay) {
      this.overlay.removeEventListener('click', this.handleClickOutside);
    }
  }

  /**
   * Handle keyboard navigation
   * @private
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.handleCancel();
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.moveSelection(1);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.moveSelection(-1);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.filteredDocuments.length > 0) {
          const selectedDoc = this.filteredDocuments[this.selectedIndex];
          if (selectedDoc) {
            this.handleSelect(selectedDoc.id);
          }
        }
        break;
    }
  }

  /**
   * Handle search input
   * @private
   */
  handleSearch() {
    const query = this.searchInput.value.toLowerCase().trim();

    if (!query) {
      this.filteredDocuments = [...this.documents];
    } else {
      this.filteredDocuments = this.documents.filter(doc => {
        const title = (doc.title || '').toLowerCase();
        return title.includes(query);
      });
    }

    this.selectedIndex = 0;
    this.renderList();
  }

  /**
   * Handle click outside dialog
   * @private
   * @param {MouseEvent} e
   */
  handleClickOutside(e) {
    if (e.target === this.overlay) {
      this.handleCancel();
    }
  }

  /**
   * Move selection up or down
   * @private
   * @param {number} direction - 1 for down, -1 for up
   */
  moveSelection(direction) {
    if (this.filteredDocuments.length === 0) return;

    let newIndex = this.selectedIndex + direction;

    // Wrap around
    if (newIndex < 0) {
      newIndex = this.filteredDocuments.length - 1;
    } else if (newIndex >= this.filteredDocuments.length) {
      newIndex = 0;
    }

    this.updateSelection(newIndex);

    // Scroll into view
    const items = this.listContainer.querySelectorAll('.document-selector__item');
    if (items[newIndex]) {
      items[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /**
   * Update selected item
   * @private
   * @param {number} index - New selected index
   */
  updateSelection(index) {
    this.selectedIndex = index;

    const items = this.listContainer.querySelectorAll('.document-selector__item');
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('document-selector__item--selected');
      } else {
        item.classList.remove('document-selector__item--selected');
      }
    });
  }

  /**
   * Handle document selection
   * @private
   * @param {number} documentId
   */
  handleSelect(documentId) {
    this.hide();
    this.onSelect(documentId);
  }

  /**
   * Handle dialog cancellation
   * @private
   */
  handleCancel() {
    this.hide();
    this.onCancel();
  }

  /**
   * Format date for display
   * @private
   * @param {string} dateString - ISO date string
   * @returns {string}
   */
  formatDate(dateString) {
    if (!dateString) return '—';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'только что';
    } else if (diffMins < 60) {
      return `${diffMins} мин. назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч. назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  /**
   * Remove dialog from DOM
   * @private
   */
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.overlay = null;
    this.dialog = null;
    this.searchInput = null;
    this.listContainer = null;
  }
}
