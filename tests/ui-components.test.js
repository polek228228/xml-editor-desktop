/**
 * @file ui-components.test.js
 * @description Unit tests for UI Components (Week 3-4)
 */

// Mock DOM and global objects
const createModuleResponse = () => ({
  success: true,
  modules: [
    {
      id: 'test-service',
      name: 'Test Service',
      description: 'Mock service',
      version: '1.0.0',
      category: 'documents',
      type: 'document',
      icon: '🧪',
      price: 0,
      is_installed: false,
      is_active: false,
      is_featured: true,
      rating: 4.5,
      downloads: 120,
      tags: ['test']
    }
  ]
});

global.window = {
  eventBus: {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  },
  lifecycleManager: {
    getAllServicesWithStates: jest.fn(() => [])
  },
  electronAPI: {
    listModules: jest.fn(() => Promise.resolve(createModuleResponse()))
  }
};

global.document = {
  createElement: jest.fn((tag) => ({
    className: '',
    textContent: '',
    style: {},
    appendChild: jest.fn(),
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    }
  })),
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  addEventListener: jest.fn()
};

describe('Activity Bar Component', () => {
  let ActivityBar;
  let activityBar;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Load component (assuming CommonJS export)
    ActivityBar = require('../src/renderer/js/components/activity-bar.js');
    activityBar = new ActivityBar();
  });

  test('should initialize with empty items', () => {
    expect(activityBar.items).toEqual([]);
    expect(activityBar.activeItem).toBeNull();
  });

  test('should add default items on init', () => {
    // Mock DOM elements
    document.getElementById.mockReturnValue({
      parentNode: {
        insertBefore: jest.fn()
      }
    });

    activityBar.init();

    expect(activityBar.items.length).toBe(4); // home, documents, services, settings
    expect(activityBar.items[0].id).toBe('home');
  });

  test('should set active item', () => {
    activityBar.items = [
      { id: 'home', icon: '🏠', title: 'Home', target: 'home', order: 1 }
    ];

    activityBar.setActive('home');

    expect(activityBar.activeItem).toBe('home');
  });

  test('should update badge count', () => {
    activityBar.items = [
      { id: 'services', icon: '🔧', title: 'Services', target: 'services', order: 3 }
    ];

    activityBar.setBadge('services', 5);

    expect(activityBar.items[0].badge).toBe(5);
  });
});

describe('Tab Bar Component', () => {
  let TabBar;
  let tabBar;

  beforeEach(() => {
    jest.clearAllMocks();
    TabBar = require('../src/renderer/js/components/tab-bar.js');
    tabBar = new TabBar();
  });

  test('should initialize with no tabs', () => {
    expect(tabBar.tabs).toEqual([]);
    expect(tabBar.activeTab).toBeNull();
  });

  test('should add new tab', () => {
    const tab = {
      id: 'doc-1',
      title: 'Document 1',
      type: 'document'
    };

    const result = tabBar.addTab(tab);

    expect(result).toBe(true);
    expect(tabBar.tabs.length).toBe(1);
    expect(tabBar.tabs[0].id).toBe('doc-1');
  });

  test('should not exceed max tabs', () => {
    tabBar.maxTabs = 2;

    tabBar.addTab({ id: 'doc-1', title: 'Doc 1' });
    tabBar.addTab({ id: 'doc-2', title: 'Doc 2' });
    const result = tabBar.addTab({ id: 'doc-3', title: 'Doc 3' });

    expect(result).toBe(false);
    expect(tabBar.tabs.length).toBe(2);
  });

  test('should set dirty state', () => {
    tabBar.tabs = [{ id: 'doc-1', title: 'Doc 1', dirty: false }];

    tabBar.setDirty('doc-1', true);

    expect(tabBar.tabs[0].dirty).toBe(true);
  });

  test('should remove tab', () => {
    tabBar.tabs = [
      { id: 'doc-1', title: 'Doc 1', dirty: false },
      { id: 'doc-2', title: 'Doc 2', dirty: false }
    ];
    tabBar.activeTab = 'doc-1';

    // Mock window.confirm
    global.window.confirm = jest.fn(() => true);

    const result = tabBar.removeTab('doc-1');

    expect(result).toBe(true);
    expect(tabBar.tabs.length).toBe(1);
  });
});

describe('Service Store Component', () => {
  let ServiceStore;
  let serviceStore;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch
    global.window.electronAPI.listModules.mockResolvedValue(createModuleResponse());

    ServiceStore = require('../src/renderer/js/components/service-store.js');
    serviceStore = new ServiceStore();
  });

  test('should initialize with empty catalog', () => {
    expect(serviceStore.catalog).toEqual([]);
    expect(serviceStore.currentFilter).toBe('all');
  });

  test('should load catalog from JSON', async () => {
    await serviceStore.loadCatalog();

    expect(global.window.electronAPI.listModules).toHaveBeenCalledTimes(1);
    expect(serviceStore.catalog.length).toBe(1);
    expect(serviceStore.catalog[0].id).toBe('test-service');
  });

  test('should filter services by search query', async () => {
    await serviceStore.loadCatalog();
    serviceStore.searchQuery = 'test';

    const filtered = serviceStore._filterServices();

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('test-service');
  });

  test('should filter services by type', async () => {
    await serviceStore.loadCatalog();
    serviceStore.currentFilter = 'free';

    const filtered = serviceStore._filterServices();

    expect(filtered.length).toBe(1);
    expect(filtered[0].license).toBe('free');
  });
});

describe('Dynamic Sidebar Component', () => {
  let DynamicSidebar;
  let sidebar;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock DOM structure
    document.getElementById.mockReturnValue({
      querySelectorAll: jest.fn(() => [
        { id: 'sidebar-home', style: {} },
        { id: 'sidebar-documents', style: {} }
      ])
    });

    DynamicSidebar = require('../src/renderer/js/components/dynamic-sidebar.js');
    sidebar = new DynamicSidebar();
  });

  test('should initialize with home section', () => {
    expect(sidebar.activeSection).toBe('home');
  });

  test('should switch sections', () => {
    sidebar.sections.set('documents', { style: {} });
    sidebar.sections.set('home', { style: {} });

    sidebar.showSection('documents');

    expect(sidebar.activeSection).toBe('documents');
  });
});

describe('Context Toolbar Component', () => {
  let ContextToolbar;
  let toolbar;

  beforeEach(() => {
    jest.clearAllMocks();

    document.getElementById.mockReturnValue({
      style: {},
      addEventListener: jest.fn()
    });

    ContextToolbar = require('../src/renderer/js/components/context-toolbar.js');
    toolbar = new ContextToolbar();
  });

  test('should initialize with no document', () => {
    expect(toolbar.currentDocument).toBeNull();
  });

  test('should set document and show toolbar', () => {
    toolbar.inputs = {
      title: { value: '' },
      schemaVersion: { value: '' }
    };
    toolbar.buttons = {
      save: { disabled: true },
      saveAsTemplate: { disabled: true },
      validate: { disabled: true },
      export: { disabled: true }
    };
    toolbar.element = { style: {} };

    const doc = {
      id: 'doc-1',
      title: 'Test Doc',
      schema_version: '01.05'
    };

    toolbar.setDocument(doc);

    expect(toolbar.currentDocument).toEqual(doc);
    expect(toolbar.inputs.title.value).toBe('Test Doc');
  });

  test('should enable all buttons when document is set', () => {
    toolbar.buttons = {
      save: { disabled: true },
      saveAsTemplate: { disabled: true },
      validate: { disabled: true },
      export: { disabled: true }
    };

    toolbar.enableAllButtons();

    Object.values(toolbar.buttons).forEach(btn => {
      expect(btn.disabled).toBe(false);
    });
  });
});

// Summary
console.log(`
========================================
UI Components Test Suite
========================================
Components tested:
  ✓ Activity Bar
  ✓ Tab Bar
  ✓ Service Store
  ✓ Dynamic Sidebar
  ✓ Context Toolbar

Total: 5 components
========================================
`);
