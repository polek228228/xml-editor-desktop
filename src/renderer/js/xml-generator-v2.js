/**
 * @file xml-generator-v2.js
 * @description XML Generator V2.4 - MINIMAL valid XML for testing
 * @module renderer/xml-generator-v2
 */

class XMLGeneratorV2 {
  constructor() {
    this.namespaces = {
      '01.03': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.03',
      '01.04': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.04',
      '01.05': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.05'
    };
  }

  async generateXML(data, schemaVersion = '01.05') {
    console.log('[XMLGeneratorV2.2] Starting generation for version:', schemaVersion);

    try {
      const namespace = this.namespaces[schemaVersion];
      const xml = this.buildMinimalXML(data, namespace, schemaVersion);

      console.log('[XMLGeneratorV2.2] ✅ Generation complete, length:', xml.length);
      return xml;
    } catch (error) {
      console.error('[XMLGeneratorV2.2] ❌ Error:', error);
      throw error;
    }
  }

  buildMinimalXML(data, namespace, version) {
    const indent = (level) => '  '.repeat(level);
    const get = (obj, path, defaultValue = '') => {
      const keys = path.split('.');
      let value = obj;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return defaultValue;
      }
      return value || defaultValue;
    };

    const escape = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    // Add exp: prefix for qualified attributes (ObjectID, Placement)
    lines.push(`<ExplanatoryNote xmlns="${namespace}" xmlns:exp="${namespace}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${namespace} explanatorynote-${version.replace('.', '-')}.xsd" SchemaVersion="${version}">`);

    // 1. ExplanatoryNoteNumber (REQUIRED)
    const noteNumber = get(data, 'documentInfo.noteNumber', 'ПЗ-001-2025');
    lines.push(`${indent(1)}<ExplanatoryNoteNumber>${escape(noteNumber)}</ExplanatoryNoteNumber>`);

    // 2. ExplanatoryNoteYear (REQUIRED)
    const noteYear = get(data, 'documentInfo.year', new Date().getFullYear());
    lines.push(`${indent(1)}<ExplanatoryNoteYear>${noteYear}</ExplanatoryNoteYear>`);

    // 3. IssueAuthor (REQUIRED) - tOrganization: OrgFullName, OrgOGRN, OrgINN, OrgKPP, Address
    lines.push(`${indent(1)}<IssueAuthor>`);
    lines.push(`${indent(2)}<Organization>`);
    const issuerName = get(data, 'participants.designer.name', 'ООО "Проектная организация"');
    const issuerOgrn = get(data, 'participants.designer.ogrn', '1127746000000');
    const issuerInn = get(data, 'participants.designer.inn', '7701234567');
    const issuerKpp = get(data, 'participants.designer.kpp', '770101001');
    lines.push(`${indent(3)}<OrgFullName>${escape(issuerName)}</OrgFullName>`);
    lines.push(`${indent(3)}<OrgOGRN>${escape(issuerOgrn)}</OrgOGRN>`);
    lines.push(`${indent(3)}<OrgINN>${escape(issuerInn)}</OrgINN>`);
    lines.push(`${indent(3)}<OrgKPP>${escape(issuerKpp)}</OrgKPP>`);
    lines.push(`${indent(3)}<Address>`);
    const issuerRegion = get(data, 'participants.designer.address.region', '77');
    const issuerCity = get(data, 'participants.designer.address.city', 'г. Москва');
    const issuerStreet = get(data, 'participants.designer.address.street', 'ул. Тверская');
    lines.push(`${indent(4)}<Region>${escape(issuerRegion)}</Region>`);
    lines.push(`${indent(4)}<City>${escape(issuerCity)}</City>`);
    lines.push(`${indent(4)}<Street>${escape(issuerStreet)}</Street>`);
    lines.push(`${indent(3)}</Address>`);
    lines.push(`${indent(2)}</Organization>`);
    lines.push(`${indent(1)}</IssueAuthor>`);

    // 4. Signers (REQUIRED) - tChiefProjectEngineer: FamilyName, FirstName, SecondName, SNILS, NOPRIZ
    lines.push(`${indent(1)}<Signers>`);
    lines.push(`${indent(2)}<ChiefProjectEngineer>`);
    const chiefName = get(data, 'participants.designer.chiefEngineer.fullName', 'Иванов Иван Иванович');
    const nameParts = chiefName.split(' ');
    lines.push(`${indent(3)}<FamilyName>${escape(nameParts[0] || 'Иванов')}</FamilyName>`);
    lines.push(`${indent(3)}<FirstName>${escape(nameParts[1] || 'Иван')}</FirstName>`);
    lines.push(`${indent(3)}<SecondName>${escape(nameParts[2] || 'Иванович')}</SecondName>`);
    const chiefSnils = get(data, 'participants.designer.chiefEngineer.snils', '123-456-789 00');
    const chiefNopriz = get(data, 'participants.designer.chiefEngineer.nopriz', 'П-123456');
    lines.push(`${indent(3)}<SNILS>${escape(chiefSnils)}</SNILS>`);
    lines.push(`${indent(3)}<NOPRIZ>${escape(chiefNopriz)}</NOPRIZ>`);
    lines.push(`${indent(2)}</ChiefProjectEngineer>`);
    lines.push(`${indent(1)}</Signers>`);

    // 5. Developer (REQUIRED) - tOrganization: OrgFullName, OrgOGRN, OrgINN, OrgKPP, Address
    lines.push(`${indent(1)}<Developer>`);
    lines.push(`${indent(2)}<Organization>`);
    const developerName = get(data, 'participants.customer.name', 'ООО "Заказчик"');
    const developerOgrn = get(data, 'participants.customer.ogrn', '1125024567890');
    const developerInn = get(data, 'participants.customer.inn', '7702345678');
    const developerKpp = get(data, 'participants.customer.kpp', '770201001');
    lines.push(`${indent(3)}<OrgFullName>${escape(developerName)}</OrgFullName>`);
    lines.push(`${indent(3)}<OrgOGRN>${escape(developerOgrn)}</OrgOGRN>`);
    lines.push(`${indent(3)}<OrgINN>${escape(developerInn)}</OrgINN>`);
    lines.push(`${indent(3)}<OrgKPP>${escape(developerKpp)}</OrgKPP>`);
    lines.push(`${indent(3)}<Address>`);
    const developerRegion = get(data, 'participants.customer.address.region', '77');
    const developerCity = get(data, 'participants.customer.address.city', 'г. Москва');
    const developerStreet = get(data, 'participants.customer.address.street', 'ул. Арбат');
    lines.push(`${indent(4)}<Region>${escape(developerRegion)}</Region>`);
    lines.push(`${indent(4)}<City>${escape(developerCity)}</City>`);
    lines.push(`${indent(4)}<Street>${escape(developerStreet)}</Street>`);
    lines.push(`${indent(3)}</Address>`);
    lines.push(`${indent(2)}</Organization>`);
    lines.push(`${indent(1)}</Developer>`);

    // 6. UsedNorms (REQUIRED)
    lines.push(`${indent(1)}<UsedNorms>`);
    const norms = get(data, 'designTask.norms', []);
    if (norms.length > 0) {
      norms.forEach(norm => {
        lines.push(`${indent(2)}<UsedNorm>${escape(norm)}</UsedNorm>`);
      });
    } else {
      lines.push(`${indent(2)}<UsedNorm>СП 50.13330.2012 Тепловая защита зданий</UsedNorm>`);
    }
    lines.push(`${indent(1)}</UsedNorms>`);

    // 7. ProjectDecisionDocuments (REQUIRED) - tDocument: DocType, DocName, DocNumber, DocDate, File/Included/Link
    lines.push(`${indent(1)}<ProjectDecisionDocuments>`);
    lines.push(`${indent(2)}<Document>`);
    lines.push(`${indent(3)}<DocType>15.01</DocType>`);
    const decisionDocName = get(data, 'designTask.basisForDesign', 'Решение о подготовке проектной документации');
    lines.push(`${indent(3)}<DocName>${escape(decisionDocName)}</DocName>`);
    lines.push(`${indent(3)}<DocNumber>№1</DocNumber>`);
    const decisionDate = get(data, 'designTask.taskDate', '2024-05-10');
    lines.push(`${indent(3)}<DocDate>${escape(decisionDate)}</DocDate>`);
    lines.push(`${indent(3)}<DocIssueAuthor>Заказчик</DocIssueAuthor>`);
    lines.push(`${indent(3)}<Included>Включен в состав проектной документации</Included>`);
    lines.push(`${indent(2)}</Document>`);
    lines.push(`${indent(1)}</ProjectDecisionDocuments>`);

    // 8. ProjectInitialDocuments (REQUIRED) - tDocument: DocType, DocName, DocNumber, DocDate, File/Included/Link
    lines.push(`${indent(1)}<ProjectInitialDocuments>`);
    lines.push(`${indent(2)}<Document>`);
    lines.push(`${indent(3)}<DocType>03.01</DocType>`);
    const gpzuName = get(data, 'planningDocumentation.gpzu', 'Градостроительный план земельного участка');
    lines.push(`${indent(3)}<DocName>${escape(gpzuName)}</DocName>`);
    lines.push(`${indent(3)}<DocNumber>№ГПЗУ-123</DocNumber>`);
    const gpzuDate = get(data, 'planningDocumentation.gpzuDate', '2024-03-01');
    lines.push(`${indent(3)}<DocDate>${escape(gpzuDate)}</DocDate>`);
    lines.push(`${indent(3)}<DocIssueAuthor>Департамент градостроительства</DocIssueAuthor>`);
    lines.push(`${indent(3)}<Included>Включен в состав исходно-разрешительной документации</Included>`);
    lines.push(`${indent(2)}</Document>`);
    lines.push(`${indent(1)}</ProjectInitialDocuments>`);

    // 9. NonIndustrialObject (REQUIRED) - WITH NAMESPACE-QUALIFIED ATTRIBUTES!
    // ObjectID and Placement are global attributes in XSD => require namespace prefix
    // Placement: "1" = на суше, "2" = на воде
    lines.push(`${indent(1)}<NonIndustrialObject exp:ObjectID="OBJ-001" exp:Placement="1">`);

    // 9.1 Name (REQUIRED)
    const objectName = get(data, 'basicInfo.projectName', 'Объект капитального строительства');
    lines.push(`${indent(2)}<Name>${escape(objectName)}</Name>`);

    // 9.2 ConstructionType (REQUIRED) - Integer: 1=Строительство, 2=Реконструкция, 3=Капитальный ремонт, 4=Капремонт с реконструкцией
    const constructionType = get(data, 'basicInfo.constructionType', '1');
    lines.push(`${indent(2)}<ConstructionType>${constructionType}</ConstructionType>`);

    // 9.3 Address (REQUIRED)
    lines.push(`${indent(2)}<Address>`);
    const region = get(data, 'landPlot.address.region', '77');
    const city = get(data, 'landPlot.address.city', 'г. Москва');
    const street = get(data, 'landPlot.address.street', 'ул. Тверская');
    lines.push(`${indent(3)}<Region>${escape(region)}</Region>`);
    lines.push(`${indent(3)}<City>${escape(city)}</City>`);
    lines.push(`${indent(3)}<Street>${escape(street)}</Street>`);
    lines.push(`${indent(2)}</Address>`);

    // 9.4 Functions (REQUIRED) - tFunctions: FunctionsNote (string, optional), FunctionsClass (REQUIRED)
    lines.push(`${indent(2)}<Functions>`);
    const functionalPurpose = get(data, 'basicInfo.objectPurpose', 'Жилое здание');
    lines.push(`${indent(3)}<FunctionsNote>${escape(functionalPurpose)}</FunctionsNote>`);
    const functionsClass = get(data, 'basicInfo.functionsClass', '01.01.001');
    lines.push(`${indent(3)}<FunctionsClass>${escape(functionsClass)}</FunctionsClass>`);
    lines.push(`${indent(2)}</Functions>`);

    // 9.5 FunctionsFeatures (REQUIRED) - FIXED: tTextBlock with Text element
    lines.push(`${indent(2)}<FunctionsFeatures>`);
    lines.push(`${indent(3)}<Text>Объект не относится к транспортной инфраструктуре</Text>`);
    lines.push(`${indent(2)}</FunctionsFeatures>`);

    // 9.6 PowerIndicator (REQUIRED) - tTEI: Name, Measure, Value
    lines.push(`${indent(2)}<PowerIndicator>`);
    lines.push(`${indent(3)}<Name>Общая площадь</Name>`);
    lines.push(`${indent(3)}<Measure>383</Measure>`);
    const totalArea = get(data, 'technicalData.totalArea', '1000');
    lines.push(`${indent(3)}<Value>${escape(totalArea)}</Value>`);
    lines.push(`${indent(2)}</PowerIndicator>`);

    // 9.7 EnergyEfficiency (REQUIRED) - FIXED: EnergyEfficiencyClass
    lines.push(`${indent(2)}<EnergyEfficiency>`);
    const efficiencyClass = get(data, 'basicInfo.energyEfficiencyClass', 'B');
    lines.push(`${indent(3)}<EnergyEfficiencyClass>${escape(efficiencyClass)}</EnergyEfficiencyClass>`);
    lines.push(`${indent(2)}</EnergyEfficiency>`);

    // 9.8 Choice - FIXED: FireDangerCategory with correct enum
    lines.push(`${indent(2)}<FireDangerCategory>Категория не устанавливается</FireDangerCategory>`);

    // 9.9 PeoplePermanentStay - FIXED: tTextBlock with Text
    lines.push(`${indent(2)}<PeoplePermanentStay>`);
    lines.push(`${indent(3)}<Text>Помещения с постоянным пребыванием людей имеются</Text>`);
    lines.push(`${indent(2)}</PeoplePermanentStay>`);

    // 9.10 ResponsibilityLevel - FIXED: lowercase
    lines.push(`${indent(2)}<ResponsibilityLevel>нормальный</ResponsibilityLevel>`);

    // 9.11 Resources (REQUIRED) - tResource: Name, Measure (код ОКЕИ), Value
    lines.push(`${indent(2)}<Resources>`);
    lines.push(`${indent(3)}<Resource>`);
    lines.push(`${indent(4)}<Name>Вода</Name>`);
    lines.push(`${indent(4)}<Measure>113</Measure>`);
    const waterConsumption = get(data, 'engineeringSystems.waterSupply.consumption', '10');
    lines.push(`${indent(4)}<Value>${escape(waterConsumption)}</Value>`);
    lines.push(`${indent(3)}</Resource>`);
    lines.push(`${indent(2)}</Resources>`);

    // 9.12 LandCategory (REQUIRED) - FIXED: number 1-7
    lines.push(`${indent(2)}<LandCategory>1</LandCategory>`);

    // 9.13 ProjectDocumentation - ALL sections use NotDeveloped for simplicity
    lines.push(`${indent(2)}<ProjectDocumentation>`);

    // Section2-13: All NotDeveloped
    for (let i = 2; i <= 13; i++) {
      lines.push(`${indent(3)}<Section${i}>`);
      lines.push(`${indent(4)}<NotDeveloped>Раздел не разрабатывался</NotDeveloped>`);
      lines.push(`${indent(3)}</Section${i}>`);
    }

    lines.push(`${indent(2)}</ProjectDocumentation>`);

    lines.push(`${indent(1)}</NonIndustrialObject>`);

    // 10. DesignerAssurance (REQUIRED) - FIXED: tTextBlock with Text
    lines.push(`${indent(1)}<DesignerAssurance>`);
    lines.push(`${indent(2)}<Text>Проектная документация разработана в соответствии с градостроительным планом земельного участка, заданием на проектирование и техническими регламентами.</Text>`);
    lines.push(`${indent(1)}</DesignerAssurance>`);

    lines.push('</ExplanatoryNote>');

    return lines.join('\n');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.XMLGeneratorV2 = XMLGeneratorV2;
}
