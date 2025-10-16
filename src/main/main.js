/**
 * @file main.js
 * @description Main process entry point for XML Editor Desktop application
 * @module main
 */

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const StorageManager = require('./storage-manager');
const ModuleRegistry = require('./module-registry');
const xmlValidator = require('./xml-validator');

/**
 * Main application class for XML Editor Desktop
 * Manages Electron lifecycle, window creation, and IPC communication
 */
class XMLEditorApplication {
  constructor() {
    /** @type {BrowserWindow|null} */
    this.mainWindow = null;

    /** @type {StorageManager} */
    this.storage = new StorageManager(
      path.join(app.getPath('userData'), 'xmleditor.db')
    );

    /** @type {ModuleRegistry} */
    this.moduleRegistry = new ModuleRegistry(this.storage);

    this.setupEventHandlers();
  }

  /**
   * Setup application event handlers
   * @private
   */
  setupEventHandlers() {
    app.on('ready', () => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    app.on('activate', () => this.onActivate());
  }

  /**
   * Handler for app ready event
   * @private
   */
  async onReady() {
    try {
      await this.storage.initialize();
      await this.moduleRegistry.initialize();

      // Seed default modules on first run
      await this.moduleRegistry.seedDefaultModules();

      this.createWindow();
      this.setupIPC();
      this.createMenu();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      app.quit();
    }
  }

  /**
   * Handler for window-all-closed event
   * @private
   */
  onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  /**
   * Handler for activate event (macOS)
   * @private
   */
  onActivate() {
    if (this.mainWindow === null) {
      this.createWindow();
    }
  }

  /**
   * Create main application window with security configuration
   * @private
   */
  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      title: 'XML Editor Desktop',
      backgroundColor: '#f5f5f5',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, '../preload/preload.js')
      }
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  /**
   * Setup IPC handlers for communication with renderer process
   * @private
   */
  setupIPC() {
    // Document operations
    ipcMain.handle('document:create', async (event, data) => {
      try {
        const { title, schema_version, content } = data;

        if (!title || !schema_version || !content) {
          throw new Error('Missing required fields: title, schema_version, or content');
        }

        const documentId = await this.storage.createDocument({
          title,
          schema_version,
          content: JSON.stringify(content),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        return { success: true, id: documentId };
      } catch (error) {
        console.error('Error creating document:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('document:save', async (event, data) => {
      try {
        const { id, title, content, xml_content, is_valid } = data;

        if (!id) {
          throw new Error('Document ID is required');
        }

        await this.storage.updateDocument(id, {
          title: title || undefined,
          content: content ? JSON.stringify(content) : undefined,
          xml_content: xml_content || undefined,
          is_valid: is_valid !== undefined ? is_valid : undefined,
          updated_at: new Date().toISOString()
        });

        return { success: true };
      } catch (error) {
        console.error('Error saving document:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('document:load', async (event, documentId) => {
      try {
        if (!documentId) {
          throw new Error('Document ID is required');
        }

        const document = await this.storage.getDocument(documentId);

        if (!document) {
          throw new Error('Document not found');
        }

        // Parse JSON content
        if (document.content) {
          try {
            document.content = JSON.parse(document.content);
          } catch (e) {
            console.error('Error parsing document content:', e);
          }
        }

        return { success: true, document };
      } catch (error) {
        console.error('Error loading document:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('document:list', async () => {
      try {
        const documents = await this.storage.listDocuments();
        return { success: true, documents };
      } catch (error) {
        console.error('Error listing documents:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('document:delete', async (event, documentId) => {
      try {
        if (!documentId) {
          throw new Error('Document ID is required');
        }

        await this.storage.deleteDocument(documentId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: error.message };
      }
    });

    // Autosave operations
    ipcMain.handle('document:autosave', async (event, data) => {
      try {
        const { document_id, content } = data;

        if (!document_id || !content) {
          throw new Error('Missing required fields: document_id or content');
        }

        await this.storage.createAutosave({
          document_id,
          content: JSON.stringify(content),
          created_at: new Date().toISOString()
        });

        return { success: true };
      } catch (error) {
        console.error('Error creating autosave:', error);
        return { success: false, error: error.message };
      }
    });

    // Settings operations
    ipcMain.handle('settings:get', async (event, key) => {
      try {
        if (!key) {
          throw new Error('Settings key is required');
        }

        const setting = await this.storage.getSetting(key);
        return { success: true, value: setting ? setting.value : null };
      } catch (error) {
        console.error('Error getting setting:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('settings:set', async (event, { key, value }) => {
      try {
        if (!key) {
          throw new Error('Settings key is required');
        }

        await this.storage.setSetting(key, value);
        return { success: true };
      } catch (error) {
        console.error('Error setting setting:', error);
        return { success: false, error: error.message };
      }
    });

    // Dialog operations
    ipcMain.handle('dialog:show-save', async (event, options) => {
      try {
        const result = await dialog.showSaveDialog(this.mainWindow, {
          title: options?.title || 'Сохранить файл',
          defaultPath: options?.defaultPath || 'document.xml',
          filters: options?.filters || [
            { name: 'XML Files', extensions: ['xml'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        return { success: true, ...result };
      } catch (error) {
        console.error('Error showing save dialog:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('dialog:show-open', async (event, options) => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow, {
          title: options?.title || 'Открыть файл',
          filters: options?.filters || [
            { name: 'XML Files', extensions: ['xml'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        });

        return { success: true, ...result };
      } catch (error) {
        console.error('Error showing open dialog:', error);
        return { success: false, error: error.message };
      }
    });

    // Template operations
    ipcMain.handle('template:create', async (event, data) => {
      try {
        const { name, description, schema_version, content } = data;

        if (!name || !schema_version || !content) {
          throw new Error('Missing required fields: name, schema_version, or content');
        }

        const templateId = await this.storage.createTemplate({
          name,
          description: description || null,
          schema_version,
          content: JSON.stringify(content),
          created_at: new Date().toISOString()
        });

        return { success: true, id: templateId };
      } catch (error) {
        console.error('Error creating template:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('template:list', async () => {
      try {
        const templates = await this.storage.listTemplates();
        return { success: true, templates };
      } catch (error) {
        console.error('Error listing templates:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('template:delete', async (event, templateId) => {
      try {
        if (!templateId) {
          throw new Error('Template ID is required');
        }

        await this.storage.deleteTemplate(templateId);
        return { success: true };
      } catch (error) {
        console.error('Error deleting template:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('template:update', async (event, data) => {
      try {
        if (!data.id) {
          throw new Error('Template ID is required');
        }

        await this.storage.updateTemplate(data.id, {
          name: data.name,
          description: data.description
        });

        return { success: true, template: data };
      } catch (error) {
        console.error('Error updating template:', error);
        return { success: false, error: error.message };
      }
    });

    // File operations
    ipcMain.handle('file:write-xml', async (event, { filePath, content }) => {
      try {
        if (!filePath) {
          throw new Error('File path is required');
        }

        if (!content) {
          throw new Error('Content is required');
        }

        const fs = require('fs');
        fs.writeFileSync(filePath, content, 'utf-8');

        console.log(`✅ XML file written successfully: ${filePath}`);
        return { success: true, filePath };
      } catch (error) {
        console.error('Error writing XML file:', error);
        return { success: false, error: error.message };
      }
    });

    // XML validation operations
    ipcMain.handle('xml:validate', async (event, { xmlContent, schemaVersion }) => {
      try {
        console.log(`[IPC] xml:validate called with schema version: ${schemaVersion}`);
        console.log(`[IPC] XML content length: ${xmlContent?.length || 0} bytes`);

        if (!xmlContent) {
          throw new Error('XML content is required');
        }

        if (!schemaVersion) {
          throw new Error('Schema version is required');
        }

        const result = xmlValidator.validateXML(xmlContent, schemaVersion);

        console.log(`[IPC] Validation result: ${result.valid ? 'VALID' : 'INVALID'}`);
        if (!result.valid && result.errors.length > 0) {
          console.log(`[IPC] Found ${result.errors.length} validation errors`);
        }

        return { success: true, ...result };
      } catch (error) {
        console.error('[IPC] Error validating XML:', error);
        return {
          success: false,
          valid: false,
          errors: [{
            type: 'ipc_error',
            message: error.message,
            stack: error.stack
          }],
          schemaVersion
        };
      }
    });

    // ==================== MODULE OPERATIONS ====================

    ipcMain.handle('module:list', async (event, options) => {
      try {
        const modules = await this.storageManager.listModules(options || {});
        return { success: true, modules };
      } catch (error) {
        console.error('Error listing modules:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('module:get', async (event, moduleId) => {
      try {
        if (!moduleId) {
          throw new Error('Module ID is required');
        }

        const module = await this.storageManager.getModule(moduleId);
        return { success: true, module };
      } catch (error) {
        console.error('Error getting module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('module:install', async (event, moduleId) => {
      try {
        if (!moduleId) {
          throw new Error('Module ID is required');
        }

        await this.storageManager.installModule(moduleId);
        return { success: true };
      } catch (error) {
        console.error('Error installing module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('module:uninstall', async (event, moduleId) => {
      try {
        if (!moduleId) {
          throw new Error('Module ID is required');
        }

        await this.storageManager.uninstallModule(moduleId);
        return { success: true };
      } catch (error) {
        console.error('Error uninstalling module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('module:activate', async (event, moduleId) => {
      try {
        if (!moduleId) {
          throw new Error('Module ID is required');
        }

        await this.storageManager.activateModule(moduleId);
        return { success: true };
      } catch (error) {
        console.error('Error activating module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('module:deactivate', async (event, moduleId) => {
      try {
        if (!moduleId) {
          throw new Error('Module ID is required');
        }

        await this.storageManager.deactivateModule(moduleId);
        return { success: true };
      } catch (error) {
        console.error('Error deactivating module:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('module:statistics', async () => {
      try {
        const stats = await this.storageManager.getModuleStatistics();
        return { success: true, statistics: stats };
      } catch (error) {
        console.error('Error getting module statistics:', error);
        return { success: false, error: error.message };
      }
    });
  }

  /**
   * Create application menu
   * @private
   */
  createMenu() {
    const template = [
      {
        label: 'Файл',
        submenu: [
          {
            label: 'Новый документ',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow?.webContents.send('menu:new-document');
            }
          },
          {
            label: 'Открыть документ',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.mainWindow?.webContents.send('menu:open-document');
            }
          },
          {
            label: 'Сохранить',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('menu:save-document');
            }
          },
          { type: 'separator' },
          {
            label: 'Экспорт в XML',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow?.webContents.send('menu:export-xml');
            }
          },
          { type: 'separator' },
          {
            label: 'Выход',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Правка',
        submenu: [
          { role: 'undo', label: 'Отменить' },
          { role: 'redo', label: 'Повторить' },
          { type: 'separator' },
          { role: 'cut', label: 'Вырезать' },
          { role: 'copy', label: 'Копировать' },
          { role: 'paste', label: 'Вставить' },
          { role: 'selectAll', label: 'Выделить все' }
        ]
      },
      {
        label: 'Шаблоны',
        submenu: [
          {
            label: 'Из шаблона',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              this.mainWindow?.webContents.send('menu:load-template');
            }
          },
          {
            label: 'Сохранить как шаблон',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              this.mainWindow?.webContents.send('menu:save-template');
            }
          },
          { type: 'separator' },
          {
            label: 'Управление шаблонами',
            click: () => {
              this.mainWindow?.webContents.send('menu:manage-templates');
            }
          }
        ]
      },
      {
        label: 'Инструменты',
        submenu: [
          {
            label: 'Проверить XML',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: () => {
              this.mainWindow?.webContents.send('menu:validate-xml');
            }
          },
          {
            label: 'Генерация PDF',
            accelerator: 'CmdOrCtrl+P',
            enabled: false, // Week 5-6
            click: () => {
              this.mainWindow?.webContents.send('menu:generate-pdf');
            }
          },
          { type: 'separator' },
          {
            label: 'История версий',
            accelerator: 'CmdOrCtrl+H',
            enabled: false, // Week 7-8
            click: () => {
              this.mainWindow?.webContents.send('menu:version-history');
            }
          },
          {
            label: 'Импорт XML',
            accelerator: 'CmdOrCtrl+I',
            enabled: false, // Week 7-8
            click: () => {
              this.mainWindow?.webContents.send('menu:import-xml');
            }
          },
          { type: 'separator' },
          {
            label: 'Предпросмотр документа',
            enabled: false, // Future
            click: () => {
              this.mainWindow?.webContents.send('menu:preview-document');
            }
          }
        ]
      },
      {
        label: 'Модули',
        submenu: [
          {
            label: 'Управление модулями',
            enabled: false, // Week 4
            click: () => {
              this.mainWindow?.webContents.send('menu:manage-modules');
            }
          },
          {
            label: 'Установить модуль',
            enabled: false, // Week 4
            click: () => {
              this.mainWindow?.webContents.send('menu:install-module');
            }
          },
          {
            label: 'Обновить модули',
            enabled: false, // Week 4
            click: () => {
              this.mainWindow?.webContents.send('menu:update-modules');
            }
          }
        ]
      },
      {
        label: 'Вид',
        submenu: [
          { role: 'reload', label: 'Перезагрузить' },
          { role: 'toggleDevTools', label: 'Инструменты разработчика' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Сбросить масштаб' },
          { role: 'zoomIn', label: 'Увеличить' },
          { role: 'zoomOut', label: 'Уменьшить' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Полноэкранный режим' }
        ]
      },
      {
        label: 'Настройки',
        submenu: [
          {
            label: 'Общие настройки',
            accelerator: 'CmdOrCtrl+,',
            enabled: false, // Future
            click: () => {
              this.mainWindow?.webContents.send('menu:settings-general');
            }
          },
          {
            label: 'Пути файлов',
            enabled: false, // Future
            click: () => {
              this.mainWindow?.webContents.send('menu:settings-paths');
            }
          },
          {
            label: 'Автосохранение',
            enabled: false, // Future
            click: () => {
              this.mainWindow?.webContents.send('menu:settings-autosave');
            }
          },
          { type: 'separator' },
          {
            label: 'Сбросить настройки',
            enabled: false, // Future
            click: () => {
              this.mainWindow?.webContents.send('menu:settings-reset');
            }
          }
        ]
      },
      {
        label: 'Справка',
        submenu: [
          {
            label: 'Документация',
            accelerator: 'F1',
            click: () => {
              this.mainWindow?.webContents.send('menu:help-docs');
            }
          },
          {
            label: 'Горячие клавиши',
            click: () => {
              this.mainWindow?.webContents.send('menu:help-shortcuts');
            }
          },
          { type: 'separator' },
          {
            label: 'О программе',
            click: () => {
              this.mainWindow?.webContents.send('menu:about');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Create and run application
const xmlEditorApp = new XMLEditorApplication();
