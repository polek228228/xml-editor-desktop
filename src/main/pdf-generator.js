const { BrowserWindow } = require('electron');
const fs = require('fs').promises;
const path = require('path');

/**
 * PDF Generator класс для генерации PDF документов из HTML шаблонов
 * Использует Electron webContents.printToPDF() API
 */
class PDFGenerator {
  constructor() {
    this.templateDir = path.join(__dirname, '../templates/pdf');
    this.hiddenWindow = null;
  }

  /**
   * Загрузить HTML шаблон из файла
   * @param {string} templateName - Имя шаблона (без расширения)
   * @returns {Promise<string>} - HTML содержимое шаблона
   */
  async loadTemplate(templateName) {
    const templatePath = path.join(this.templateDir, `${templateName}.html`);

    try {
      const html = await fs.readFile(templatePath, 'utf-8');
      console.log(`[PDFGenerator] Template loaded: ${templateName}`);
      return html;
    } catch (error) {
      console.error(`[PDFGenerator] Failed to load template ${templateName}:`, error);
      throw new Error(`Не удалось загрузить шаблон: ${templateName}`);
    }
  }

  /**
   * Заменить плейсхолдеры {{variable}} в HTML на актуальные данные
   * @param {string} html - HTML шаблон с плейсхолдерами
   * @param {Object} data - Объект с данными для замены
   * @returns {string} - HTML с заполненными данными
   */
  replacePlaceholders(html, data) {
    let result = html;

    // Заменяем все {{variable}} на соответствующие значения из data
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const value = data[key] || '—'; // Используем тире для пустых значений
      result = result.replace(placeholder, this.escapeHtml(value));
    });

    // Заменяем все оставшиеся плейсхолдеры на тире
    result = result.replace(/\{\{[^}]+\}\}/g, '—');

    return result;
  }

  /**
   * Экранировать HTML специальные символы
   * @param {string} text - Текст для экранирования
   * @returns {string} - Экранированный текст
   */
  escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Извлечь данные из документа для заполнения PDF шаблона
   * @param {Object} document - Документ из базы данных
   * @returns {Object} - Объект с данными для шаблона
   */
  extractDocumentData(document) {
    const content = typeof document.content === 'string'
      ? JSON.parse(document.content)
      : document.content;

    const data = {
      // Метаданные документа
      noteNumber: content.documentInfo?.noteNumber || '',
      noteYear: content.documentInfo?.noteYear || new Date().getFullYear(),
      schemaVersion: document.schema_version || '01.05',

      // Информация об организации-разработчике (IssueAuthor)
      issuerName: content.issueAuthor?.organization?.name || '',
      issuerOgrn: content.issueAuthor?.organization?.ogrn || '',
      issuerInn: content.issueAuthor?.organization?.inn || '',
      issuerKpp: content.issueAuthor?.organization?.kpp || '',
      issuerAddress: content.issueAuthor?.organization?.address || '',

      // Главный инженер проекта
      chiefName: content.issueAuthor?.chiefEngineer?.fullName || '',
      chiefSnils: content.issueAuthor?.chiefEngineer?.snils || '',
      chiefNopriz: content.issueAuthor?.chiefEngineer?.noprizNumber || '',

      // Заказчик (Customer)
      customerName: content.participants?.customer?.name || '',
      customerOgrn: content.participants?.customer?.ogrn || '',
      customerInn: content.participants?.customer?.inn || '',
      customerKpp: content.participants?.customer?.kpp || '',
      customerAddress: content.participants?.customer?.address || '',

      // Объект строительства
      objectName: content.basicInfo?.objectName || '',
      objectPurpose: content.basicInfo?.purpose || '',
      placement: content.basicInfo?.placement || '',

      // Технические характеристики
      totalArea: content.technicalData?.totalArea || '—',
      floors: content.technicalData?.floors || '—',
      height: content.technicalData?.height || '—',
      capacity: content.technicalData?.capacity || '—',

      // Земельный участок
      cadastralNumber: content.landPlot?.cadastralNumber || '',
      landArea: content.landPlot?.area || '',
      landAddress: content.landPlot?.address || '',

      // Даты и прочее
      city: content.issueAuthor?.organization?.city || 'Москва',
      year: new Date().getFullYear(),
      date: new Date().toLocaleDateString('ru-RU')
    };

    return data;
  }

  /**
   * Создать скрытое окно для рендеринга HTML
   * @returns {BrowserWindow} - Скрытое окно Electron
   */
  createHiddenWindow() {
    if (this.hiddenWindow && !this.hiddenWindow.isDestroyed()) {
      return this.hiddenWindow;
    }

    this.hiddenWindow = new BrowserWindow({
      width: 794, // A4 width in pixels at 96 DPI (210mm)
      height: 1123, // A4 height in pixels at 96 DPI (297mm)
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    console.log('[PDFGenerator] Hidden window created');
    return this.hiddenWindow;
  }

  /**
   * Сгенерировать PDF из HTML
   * @param {string} html - HTML контент для конвертации
   * @returns {Promise<Buffer>} - PDF буфер
   */
  async generatePDFFromHTML(html) {
    return new Promise((resolve, reject) => {
      const window = this.createHiddenWindow();

      // Загружаем HTML в окно
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      // Ждем завершения загрузки
      window.webContents.on('did-finish-load', async () => {
        try {
          // Настройки печати для A4
          const pdfOptions = {
            marginsType: 1, // Custom margins
            pageSize: 'A4',
            printBackground: true,
            printSelectionOnly: false,
            landscape: false,
            margins: {
              top: 2, // 2cm
              bottom: 2, // 2cm
              left: 3, // 3cm
              right: 2 // 2cm
            }
          };

          console.log('[PDFGenerator] Generating PDF with options:', pdfOptions);

          // Генерируем PDF
          const pdfBuffer = await window.webContents.printToPDF(pdfOptions);

          console.log(`[PDFGenerator] PDF generated successfully (${pdfBuffer.length} bytes)`);
          resolve(pdfBuffer);

        } catch (error) {
          console.error('[PDFGenerator] Failed to generate PDF:', error);
          reject(new Error('Ошибка генерации PDF: ' + error.message));
        }
      });

      // Обработка ошибок загрузки
      window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('[PDFGenerator] Failed to load HTML:', errorDescription);
        reject(new Error(`Ошибка загрузки HTML: ${errorDescription}`));
      });
    });
  }

  /**
   * Сохранить PDF буфер в файл
   * @param {Buffer} pdfBuffer - PDF данные
   * @param {string} filePath - Путь для сохранения файла
   * @returns {Promise<void>}
   */
  async savePDF(pdfBuffer, filePath) {
    try {
      await fs.writeFile(filePath, pdfBuffer);
      console.log(`[PDFGenerator] PDF saved to: ${filePath}`);
    } catch (error) {
      console.error('[PDFGenerator] Failed to save PDF:', error);
      throw new Error('Ошибка сохранения PDF: ' + error.message);
    }
  }

  /**
   * Главный метод: сгенерировать PDF из документа
   * @param {Object} document - Документ из базы данных
   * @param {string} outputPath - Путь для сохранения PDF
   * @param {string} templateName - Имя шаблона (по умолчанию 'explanatory-note-template')
   * @returns {Promise<string>} - Путь к созданному PDF файлу
   */
  async generatePDF(document, outputPath, templateName = 'explanatory-note-template') {
    try {
      console.log(`[PDFGenerator] Starting PDF generation for document: ${document.title}`);

      // 1. Загружаем HTML шаблон
      const templateHTML = await this.loadTemplate(templateName);

      // 2. Извлекаем данные из документа
      const data = this.extractDocumentData(document);

      // 3. Заполняем шаблон данными
      const filledHTML = this.replacePlaceholders(templateHTML, data);

      // 4. Генерируем PDF
      const pdfBuffer = await this.generatePDFFromHTML(filledHTML);

      // 5. Сохраняем в файл
      await this.savePDF(pdfBuffer, outputPath);

      console.log(`[PDFGenerator] PDF generation completed: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('[PDFGenerator] PDF generation failed:', error);
      throw error;
    }
  }

  /**
   * Очистить ресурсы (закрыть скрытое окно)
   */
  cleanup() {
    if (this.hiddenWindow && !this.hiddenWindow.isDestroyed()) {
      this.hiddenWindow.close();
      this.hiddenWindow = null;
      console.log('[PDFGenerator] Hidden window closed');
    }
  }
}

module.exports = PDFGenerator;
