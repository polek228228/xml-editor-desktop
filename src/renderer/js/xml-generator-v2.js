/**
 * @file xml-generator-v2.js
 * @description NEW XML Generator with correct XSD mapping for Ministry schemas
 * @module renderer/xml-generator-v2
 */

/**
 * XML Generator V2 - Creates valid XML according to Ministry XSD schemas
 *
 * Key differences from v1:
 * - Correct element order per XSD xs:sequence
 * - Proper attribute naming (SchemaVersion not Version)
 * - Correct element names (ExplanatoryNoteNumber not DocumentInfo)
 */
class XMLGeneratorV2 {
  constructor() {
    this.namespaces = {
      '01.03': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.03',
      '01.04': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.04',
      '01.05': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.05'
    };
  }

  /**
   * Generate XML from JSON data
   * @param {Object} data - Form data
   * @param {string} schemaVersion - Schema version
   * @returns {Promise<string>} XML string
   */
  async generateXML(data, schemaVersion = '01.05') {
    console.log('[XMLGeneratorV2] Starting generation for version:', schemaVersion);

    try {
      const namespace = this.namespaces[schemaVersion];
      const xml = this.buildMinimalXML(data, namespace, schemaVersion);

      console.log('[XMLGeneratorV2] ✅ Generation complete');
      return xml;
    } catch (error) {
      console.error('[XMLGeneratorV2] ❌ Error:', error);
      throw error;
    }
  }

  /**
   * Build minimal valid XML structure
   * @param {Object} data - Form data
   * @param {string} namespace - XML namespace
   * @param {string} version - Schema version
   * @returns {string} XML string
   */
  buildMinimalXML(data, namespace, version) {
    const indent = (level) => '  '.repeat(level);

    // Helper to get value with fallback
    const get = (obj, path, defaultValue = '') => {
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return defaultValue;
      }
      return value || defaultValue;
    };

    // Helper to escape XML
    const escape = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Start building XML
    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push(`<ExplanatoryNote xmlns="${namespace}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${namespace} explanatorynote-${version.replace('.', '-')}.xsd" SchemaVersion="${version}">`);

    // 1. ExplanatoryNoteNumber (REQUIRED)
    const noteNumber = get(data, 'documentInfo.noteNumber', 'ПЗ-001-2025');
    lines.push(`${indent(1)}<ExplanatoryNoteNumber>${escape(noteNumber)}</ExplanatoryNoteNumber>`);

    // 2. ExplanatoryNoteYear (REQUIRED)
    const noteYear = get(data, 'documentInfo.year', new Date().getFullYear());
    lines.push(`${indent(1)}<ExplanatoryNoteYear>${noteYear}</ExplanatoryNoteYear>`);

    // 3. IssueAuthor (REQUIRED) - генеральный проектировщик
    lines.push(`${indent(1)}<IssueAuthor>`);
    lines.push(`${indent(2)}<Organization>`);
    const orgName = get(data, 'participants.contractor.name', 'Организация не указана');
    const orgInn = get(data, 'participants.contractor.inn', '0000000000');
    lines.push(`${indent(3)}<Name>${escape(orgName)}</Name>`);
    lines.push(`${indent(3)}<INN>${escape(orgInn)}</INN>`);
    lines.push(`${indent(2)}</Organization>`);
    lines.push(`${indent(1)}</IssueAuthor>`);

    // 4. Signers (REQUIRED) - лица, подписавшие документацию
    lines.push(`${indent(1)}<Signers>`);
    lines.push(`${indent(2)}<ChiefProjectEngineer>`);
    const chiefName = get(data, 'participants.chiefEngineer.name', 'Иванов Иван Иванович');
    const chiefSnils = get(data, 'participants.chiefEngineer.snils', '000-000-000 00');
    const chiefNoprizId = get(data, 'participants.chiefEngineer.noprizId', '00000000');
    lines.push(`${indent(3)}<FullName>${escape(chiefName)}</FullName>`);
    lines.push(`${indent(3)}<SNILS>${escape(chiefSnils)}</SNILS>`);
    lines.push(`${indent(3)}<NOPRIZId>${escape(chiefNoprizId)}</NOPRIZId>`);
    lines.push(`${indent(2)}</ChiefProjectEngineer>`);
    lines.push(`${indent(1)}</Signers>`);

    // 5. Developer (REQUIRED) - застройщик
    lines.push(`${indent(1)}<Developer>`);
    lines.push(`${indent(2)}<Organization>`);
    const developerName = get(data, 'participants.customer.name', 'Заказчик не указан');
    const developerInn = get(data, 'participants.customer.inn', '0000000000');
    lines.push(`${indent(3)}<Name>${escape(developerName)}</Name>`);
    lines.push(`${indent(3)}<INN>${escape(developerInn)}</INN>`);
    lines.push(`${indent(2)}</Organization>`);
    lines.push(`${indent(1)}</Developer>`);

    // 6. UsedNorms (REQUIRED) - нормативные документы
    lines.push(`${indent(1)}<UsedNorms>`);
    const norms = get(data, 'designTask.norms', []);
    if (norms.length > 0) {
      norms.forEach(norm => {
        lines.push(`${indent(2)}<UsedNorm>${escape(norm)}</UsedNorm>`);
      });
    } else {
      // Минимум один норматив
      lines.push(`${indent(2)}<UsedNorm>СП 50.13330.2012 Тепловая защита зданий</UsedNorm>`);
    }
    lines.push(`${indent(1)}</UsedNorms>`);

    // 7. ProjectDecisionDocuments (REQUIRED) - основания для проектирования
    lines.push(`${indent(1)}<ProjectDecisionDocuments>`);
    lines.push(`${indent(2)}<Document>`);
    lines.push(`${indent(3)}<DocType>Решение о подготовке проектной документации</DocType>`);
    const decisionDocName = get(data, 'designTask.basisForDesign', 'Решение не указано');
    lines.push(`${indent(3)}<DocName>${escape(decisionDocName)}</DocName>`);
    lines.push(`${indent(2)}</Document>`);
    lines.push(`${indent(1)}</ProjectDecisionDocuments>`);

    // 8. ProjectInitialDocuments (REQUIRED) - исходно-разрешительная документация
    lines.push(`${indent(1)}<ProjectInitialDocuments>`);
    lines.push(`${indent(2)}<Document>`);
    lines.push(`${indent(3)}<DocType>Градостроительный план земельного участка</DocType>`);
    const gpzuName = get(data, 'planningDocumentation.gpzu', 'ГПЗУ не указан');
    lines.push(`${indent(3)}<DocName>${escape(gpzuName)}</DocName>`);
    lines.push(`${indent(2)}</Document>`);
    lines.push(`${indent(1)}</ProjectInitialDocuments>`);

    // 9. NonIndustrialObject (REQUIRED) - описание объекта
    lines.push(`${indent(1)}<NonIndustrialObject>`);

    // 9.1 Name (REQUIRED)
    const objectName = get(data, 'basicInfo.objectName', 'Объект капитального строительства');
    lines.push(`${indent(2)}<Name>${escape(objectName)}</Name>`);

    // 9.2 ConstructionType (REQUIRED)
    const constructionType = get(data, 'basicInfo.constructionType', 'Новое строительство');
    lines.push(`${indent(2)}<ConstructionType>${escape(constructionType)}</ConstructionType>`);

    // 9.3 Address (REQUIRED)
    lines.push(`${indent(2)}<Address>`);
    const region = get(data, 'landPlot.address.region', '77');
    const city = get(data, 'landPlot.address.city', 'г. Москва');
    const street = get(data, 'landPlot.address.street', 'не указана');
    lines.push(`${indent(3)}<Region>${escape(region)}</Region>`);
    lines.push(`${indent(3)}<City>${escape(city)}</City>`);
    lines.push(`${indent(3)}<Street>${escape(street)}</Street>`);
    lines.push(`${indent(2)}</Address>`);

    // 9.4 Functions (REQUIRED) - функциональное назначение
    lines.push(`${indent(2)}<Functions>`);
    const functionalPurpose = get(data, 'basicInfo.functionalPurpose', 'Жилое здание');
    lines.push(`${indent(3)}<FunctionalPurpose>${escape(functionalPurpose)}</FunctionalPurpose>`);
    lines.push(`${indent(2)}</Functions>`);

    // 9.5 FunctionsFeatures (REQUIRED)
    const functionsFeatures = get(data, 'basicInfo.functionsFeatures', 'Объект не относится к объектам транспортной инфраструктуры');
    lines.push(`${indent(2)}<FunctionsFeatures>${escape(functionsFeatures)}</FunctionsFeatures>`);

    // 9.6 PowerIndicator (REQUIRED, min 1) - проектная мощность
    lines.push(`${indent(2)}<PowerIndicator>`);
    const capacity = get(data, 'technicalData.capacity', '100');
    const capacityUnit = get(data, 'technicalData.capacityUnit', 'м²');
    lines.push(`${indent(3)}<IndicatorName>Общая площадь</IndicatorName>`);
    lines.push(`${indent(3)}<Value>${escape(capacity)}</Value>`);
    lines.push(`${indent(3)}<Unit>${escape(capacityUnit)}</Unit>`);
    lines.push(`${indent(2)}</PowerIndicator>`);

    // 9.7 EnergyEfficiency (REQUIRED)
    lines.push(`${indent(2)}<EnergyEfficiency>`);
    const efficiencyClass = get(data, 'basicInfo.energyEfficiencyClass', 'B');
    lines.push(`${indent(3)}<EfficiencyClass>${escape(efficiencyClass)}</EfficiencyClass>`);
    lines.push(`${indent(2)}</EnergyEfficiency>`);

    // 9.8 Choice: либо (FireDangerCategory + PeoplePermanentStay + ResponsibilityLevel)
    const fireDangerCategory = get(data, 'projectSolutions.fireSafety.fireResistance', 'Не категорируется');
    lines.push(`${indent(2)}<FireDangerCategory>${escape(fireDangerCategory)}</FireDangerCategory>`);
    lines.push(`${indent(2)}<PeoplePermanentStay>Помещения с постоянным пребыванием людей имеются</PeoplePermanentStay>`);
    const responsibilityLevel = get(data, 'basicInfo.responsibilityLevel', 'Нормальный');
    lines.push(`${indent(2)}<ResponsibilityLevel>${escape(responsibilityLevel)}</ResponsibilityLevel>`);

    // 9.9 Resources (REQUIRED)
    lines.push(`${indent(2)}<Resources>`);
    lines.push(`${indent(3)}<Water>`);
    const waterConsumption = get(data, 'engineeringSystems.waterSupply.consumption', '10');
    lines.push(`${indent(4)}<Consumption>${escape(waterConsumption)}</Consumption>`);
    lines.push(`${indent(4)}<Unit>м³/сут</Unit>`);
    lines.push(`${indent(3)}</Water>`);
    lines.push(`${indent(3)}<Electricity>`);
    const powerConsumption = get(data, 'engineeringSystems.powerSupply.consumption', '50');
    lines.push(`${indent(4)}<Consumption>${escape(powerConsumption)}</Consumption>`);
    lines.push(`${indent(4)}<Unit>кВт</Unit>`);
    lines.push(`${indent(3)}</Electricity>`);
    lines.push(`${indent(2)}</Resources>`);

    // 9.10 LandCategory (REQUIRED)
    const landCategory = get(data, 'landPlot.category', 'Земли населенных пунктов');
    lines.push(`${indent(2)}<LandCategory>${escape(landCategory)}</LandCategory>`);

    // 9.11 ProjectDocumentation (REQUIRED) - проектная документация
    lines.push(`${indent(2)}<ProjectDocumentation>`);

    // Раздел 1-12 по стандарту (упрощенно, только структура)
    for (let i = 1; i <= 12; i++) {
      lines.push(`${indent(3)}<Section${i}>`);
      lines.push(`${indent(4)}<SectionContent>`);
      lines.push(`${indent(5)}<TextBlock>Раздел ${i} - содержание будет добавлено</TextBlock>`);
      lines.push(`${indent(4)}</SectionContent>`);
      lines.push(`${indent(3)}</Section${i}>`);
    }

    lines.push(`${indent(2)}</ProjectDocumentation>`);
    lines.push(`${indent(1)}</NonIndustrialObject>`);

    // 10. DesignerAssurance (REQUIRED) - заверение
    const assurance = get(data, 'basicInfo.designerAssurance',
      'Проектная документация разработана в соответствии с градостроительным планом земельного участка, ' +
      'заданием на проектирование, техническими регламентами и нормативными документами.');
    lines.push(`${indent(1)}<DesignerAssurance>${escape(assurance)}</DesignerAssurance>`);

    // Close root element
    lines.push('</ExplanatoryNote>');

    return lines.join('\n');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.XMLGeneratorV2 = XMLGeneratorV2;
}
