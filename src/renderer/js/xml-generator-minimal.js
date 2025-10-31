/**
 * @file xml-generator-minimal.js
 * @description Minimal Valid XML Generator V3.0 - Absolute minimum for XSD validation
 * @module renderer/xml-generator-minimal
 */

class XMLGeneratorMinimal {
  constructor() {
    this.namespaces = {
      '01.03': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.03',
      '01.04': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.04',
      '01.05': 'http://minstroyrf.gov.ru/schemas/explanatorynote/01.05'
    };
  }

  async generateXML(data, schemaVersion = '01.05') {
    console.log('[XMLGeneratorMinimal] Starting generation for version:', schemaVersion);

    try {
      const namespace = this.namespaces[schemaVersion];
      const xml = this.buildMinimalXML(data, namespace, schemaVersion);

      console.log('[XMLGeneratorMinimal] ✅ Generation complete, length:', xml.length);
      return xml;
    } catch (error) {
      console.error('[XMLGeneratorMinimal] ❌ Error:', error);
      throw error;
    }
  }

  buildMinimalXML(data, namespace, version) {
    const indent = (level) => '  '.repeat(level);
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

    // 1. ExplanatoryNoteNumber
    lines.push(`${indent(1)}<ExplanatoryNoteNumber>ПЗ-2025-001</ExplanatoryNoteNumber>`);

    // 2. ExplanatoryNoteYear
    lines.push(`${indent(1)}<ExplanatoryNoteYear>2025</ExplanatoryNoteYear>`);

    // 3. IssueAuthor
    lines.push(`${indent(1)}<IssueAuthor>`);
    lines.push(`${indent(2)}<Organization>`);
    lines.push(`${indent(3)}<OrgFullName>ООО "СтройПроект"</OrgFullName>`);
    lines.push(`${indent(3)}<OrgOGRN>1127746000001</OrgOGRN>`);
    lines.push(`${indent(3)}<OrgINN>7701234567</OrgINN>`);
    lines.push(`${indent(3)}<OrgKPP>770101001</OrgKPP>`);
    lines.push(`${indent(3)}<Address>`);
    lines.push(`${indent(4)}<Region>77</Region>`);
    lines.push(`${indent(4)}<City>г. Москва</City>`);
    lines.push(`${indent(4)}<Street>ул. Тверская</Street>`);
    lines.push(`${indent(3)}</Address>`);
    lines.push(`${indent(2)}</Organization>`);
    lines.push(`${indent(1)}</IssueAuthor>`);

    // 4. Signers
    lines.push(`${indent(1)}<Signers>`);
    lines.push(`${indent(2)}<ChiefProjectEngineer>`);
    lines.push(`${indent(3)}<FamilyName>Иванов</FamilyName>`);
    lines.push(`${indent(3)}<FirstName>Иван</FirstName>`);
    lines.push(`${indent(3)}<SecondName>Иванович</SecondName>`);
    lines.push(`${indent(3)}<SNILS>123-456-789 00</SNILS>`);
    lines.push(`${indent(3)}<NOPRIZ>П-123456</NOPRIZ>`);
    lines.push(`${indent(2)}</ChiefProjectEngineer>`);
    lines.push(`${indent(1)}</Signers>`);

    // 5. Developer
    lines.push(`${indent(1)}<Developer>`);
    lines.push(`${indent(2)}<Organization>`);
    lines.push(`${indent(3)}<OrgFullName>ООО "Заказчик"</OrgFullName>`);
    lines.push(`${indent(3)}<OrgOGRN>1125024567890</OrgOGRN>`);
    lines.push(`${indent(3)}<OrgINN>7702345678</OrgINN>`);
    lines.push(`${indent(3)}<OrgKPP>770201001</OrgKPP>`);
    lines.push(`${indent(3)}<Address>`);
    lines.push(`${indent(4)}<Region>77</Region>`);
    lines.push(`${indent(4)}<City>г. Москва</City>`);
    lines.push(`${indent(4)}<Street>ул. Арбат</Street>`);
    lines.push(`${indent(3)}</Address>`);
    lines.push(`${indent(2)}</Organization>`);
    lines.push(`${indent(1)}</Developer>`);

    // 6. UsedNorms
    lines.push(`${indent(1)}<UsedNorms>`);
    lines.push(`${indent(2)}<UsedNorm>СП 50.13330.2012 Тепловая защита зданий</UsedNorm>`);
    lines.push(`${indent(1)}</UsedNorms>`);

    // 7. ProjectDecisionDocuments
    lines.push(`${indent(1)}<ProjectDecisionDocuments>`);
    lines.push(`${indent(2)}<Document>`);
    lines.push(`${indent(3)}<DocType>15.01</DocType>`);
    lines.push(`${indent(3)}<DocName>Решение о подготовке проектной документации</DocName>`);
    lines.push(`${indent(3)}<DocNumber>№1</DocNumber>`);
    lines.push(`${indent(3)}<DocDate>2024-05-10</DocDate>`);
    lines.push(`${indent(3)}<DocIssueAuthor>Заказчик</DocIssueAuthor>`);
    lines.push(`${indent(3)}<Included>Включен в состав проектной документации</Included>`);
    lines.push(`${indent(2)}</Document>`);
    lines.push(`${indent(1)}</ProjectDecisionDocuments>`);

    // 8. ProjectInitialDocuments
    lines.push(`${indent(1)}<ProjectInitialDocuments>`);
    lines.push(`${indent(2)}<Document>`);
    lines.push(`${indent(3)}<DocType>03.01</DocType>`);
    lines.push(`${indent(3)}<DocName>Градостроительный план земельного участка</DocName>`);
    lines.push(`${indent(3)}<DocNumber>№ГПЗУ-123</DocNumber>`);
    lines.push(`${indent(3)}<DocDate>2024-03-01</DocDate>`);
    lines.push(`${indent(3)}<DocIssueAuthor>Департамент градостроительства</DocIssueAuthor>`);
    lines.push(`${indent(3)}<Included>Включен в состав исходно-разрешительной документации</Included>`);
    lines.push(`${indent(2)}</Document>`);
    lines.push(`${indent(1)}</ProjectInitialDocuments>`);

    // 9. NonIndustrialObject (WITH NAMESPACE-QUALIFIED ATTRIBUTES!)
    // Placement: "1" = на суше, "2" = на воде
    lines.push(`${indent(1)}<NonIndustrialObject exp:ObjectID="OBJ-001" exp:Placement="1">`);

    // 9.1 Name
    lines.push(`${indent(2)}<Name>Жилой дом</Name>`);

    // 9.2 ConstructionType (integer: 1,2,3,4)
    lines.push(`${indent(2)}<ConstructionType>1</ConstructionType>`);

    // 9.3 Address
    lines.push(`${indent(2)}<Address>`);
    lines.push(`${indent(3)}<Region>77</Region>`);
    lines.push(`${indent(3)}<City>г. Москва</City>`);
    lines.push(`${indent(3)}<Street>ул. Тверская</Street>`);
    lines.push(`${indent(2)}</Address>`);

    // 9.4 Functions
    lines.push(`${indent(2)}<Functions>`);
    lines.push(`${indent(3)}<FunctionsNote>Жилое здание</FunctionsNote>`);
    lines.push(`${indent(3)}<FunctionsClass>01.01.001</FunctionsClass>`);
    lines.push(`${indent(2)}</Functions>`);

    // 9.5 FunctionsFeatures (tTextBlock)
    lines.push(`${indent(2)}<FunctionsFeatures>`);
    lines.push(`${indent(3)}<Text>Объект не относится к транспортной инфраструктуре</Text>`);
    lines.push(`${indent(2)}</FunctionsFeatures>`);

    // 9.6 PowerIndicator (tTEI: Name, Measure, Value)
    lines.push(`${indent(2)}<PowerIndicator>`);
    lines.push(`${indent(3)}<Name>Общая площадь</Name>`);
    lines.push(`${indent(3)}<Measure>383</Measure>`);
    lines.push(`${indent(3)}<Value>1000</Value>`);
    lines.push(`${indent(2)}</PowerIndicator>`);

    // 9.7 EnergyEfficiency
    lines.push(`${indent(2)}<EnergyEfficiency>`);
    lines.push(`${indent(3)}<EnergyEfficiencyClass>B</EnergyEfficiencyClass>`);
    lines.push(`${indent(2)}</EnergyEfficiency>`);

    // 9.8 Choice - FireDangerCategory
    lines.push(`${indent(2)}<FireDangerCategory>Категория не устанавливается</FireDangerCategory>`);

    // 9.9 PeoplePermanentStay (tTextBlock)
    lines.push(`${indent(2)}<PeoplePermanentStay>`);
    lines.push(`${indent(3)}<Text>Помещения с постоянным пребыванием людей имеются</Text>`);
    lines.push(`${indent(2)}</PeoplePermanentStay>`);

    // 9.10 ResponsibilityLevel
    lines.push(`${indent(2)}<ResponsibilityLevel>нормальный</ResponsibilityLevel>`);

    // 9.11 Resources (tResource: Name, Measure, Value)
    lines.push(`${indent(2)}<Resources>`);
    lines.push(`${indent(3)}<Resource>`);
    lines.push(`${indent(4)}<Name>Вода</Name>`);
    lines.push(`${indent(4)}<Measure>113</Measure>`);
    lines.push(`${indent(4)}<Value>10</Value>`);
    lines.push(`${indent(3)}</Resource>`);
    lines.push(`${indent(2)}</Resources>`);

    // 9.12 LandCategory
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

    // 10. DesignerAssurance (tTextBlock)
    lines.push(`${indent(1)}<DesignerAssurance>`);
    lines.push(`${indent(2)}<Text>Проектная документация разработана в соответствии с градостроительным планом земельного участка, заданием на проектирование и техническими регламентами.</Text>`);
    lines.push(`${indent(1)}</DesignerAssurance>`);

    lines.push('</ExplanatoryNote>');

    return lines.join('\n');
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.XMLGeneratorMinimal = XMLGeneratorMinimal;
}
