/**
 * XML Template for Schema Version 01.05
 * Генерация XML документов для схемы Минстроя 01.05
 */

/**
 * Основная функция генерации XML
 * @param {Object} context - Контекст с данными документа
 * @returns {string} - Сгенерированный XML
 */
function generate(context) {
    const { document, formData, metadata } = context;

    console.log(`📋 Генерация XML по шаблону 01.05 для документа: ${document.title}`);

    // Извлекаем данные разделов
    const generalInfo = formData.general_info || {};
    const objectInfo = formData.object_info || {};
    const techCharacteristics = formData.technical_characteristics || {};

    // Генерируем XML документ
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ExplanatoryNote xmlns="http://fgistp.economy.gov.ru/explanatory-note/01.05"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://fgistp.economy.gov.ru/explanatory-note/01.05 explanatory-note-01.05.xsd"
                 schemaVersion="01.05">

    <!-- Метаданные документа -->
    <DocumentInfo>
        <DocumentId>${document.id || ''}</DocumentId>
        <DocumentTitle>${escapeXML(document.title || 'Новый документ')}</DocumentTitle>
        <CreatedAt>${document.createdAt || new Date().toISOString()}</CreatedAt>
        <UpdatedAt>${document.updatedAt || new Date().toISOString()}</UpdatedAt>
        <GeneratedAt>${metadata.generatedAt}</GeneratedAt>
        <Generator>${metadata.generator}</Generator>
        <GeneratorVersion>${metadata.version}</GeneratorVersion>
    </DocumentInfo>

    <!-- 1. Общие сведения -->
    <GeneralInformation>
        <ProjectTitle>${escapeXML(generalInfo.project_title || '')}</ProjectTitle>
        <ProjectCode>${escapeXML(generalInfo.project_code || '')}</ProjectCode>

        <Developer>
            <Name>${escapeXML(generalInfo.developer_name || '')}</Name>
            <Address>${escapeXML(generalInfo.developer_address || '')}</Address>
            <INN>${escapeXML(generalInfo.developer_inn || '')}</INN>
        </Developer>

        <Customer>
            <Name>${escapeXML(generalInfo.customer_name || '')}</Name>
        </Customer>

        <DocumentDate>${generalInfo.document_date || ''}</DocumentDate>
    </GeneralInformation>

    <!-- 2. Сведения об объекте капитального строительства -->
    <ObjectInformation>
        <ObjectName>${escapeXML(objectInfo.object_name || '')}</ObjectName>
        <ObjectAddress>${escapeXML(objectInfo.object_address || '')}</ObjectAddress>

        <ObjectCharacteristics>
            <ObjectType>${escapeXML(objectInfo.object_type || '')}</ObjectType>
            <BuildingClass>${escapeXML(objectInfo.building_class || '')}</BuildingClass>
            <FloorsCount>${objectInfo.floors_count || ''}</FloorsCount>
            <UndergroundFloors>${objectInfo.underground_floors || ''}</UndergroundFloors>
            <TotalArea unit="m2">${objectInfo.total_area || ''}</TotalArea>
            <BuildingVolume unit="m3">${objectInfo.building_volume || ''}</BuildingVolume>
        </ObjectCharacteristics>
    </ObjectInformation>

    <!-- 3. Технические характеристики -->
    <TechnicalCharacteristics>
        <StructuralSystems>
            <StructuralSystem>${escapeXML(techCharacteristics.structural_system || '')}</StructuralSystem>
            <FoundationType>${escapeXML(techCharacteristics.foundation_type || '')}</FoundationType>
            <WallMaterial>${escapeXML(techCharacteristics.wall_material || '')}</WallMaterial>
            <RoofType>${escapeXML(techCharacteristics.roof_type || '')}</RoofType>
        </StructuralSystems>

        <BuildingParameters>
            <CeilingHeight unit="m">${techCharacteristics.ceiling_height || ''}</CeilingHeight>
            <FireResistanceClass>${escapeXML(techCharacteristics.fire_resistance_class || '')}</FireResistanceClass>
        </BuildingParameters>
    </TechnicalCharacteristics>

    <!-- Подпись и дата формирования -->
    <DocumentSignature>
        <SignatureDate>${new Date().toISOString().split('T')[0]}</SignatureDate>
        <SignedBy>XML Editor Desktop</SignedBy>
        <DocumentVersion>1.0</DocumentVersion>
    </DocumentSignature>

</ExplanatoryNote>`;

    console.log(`✅ XML документ сгенерирован (${xml.length} символов)`);
    return xml;
}

/**
 * Экранирование XML специальных символов
 * @param {string} text - Исходный текст
 * @returns {string} - Экранированный текст
 */
function escapeXML(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Получение информации о шаблоне
 * @returns {Object} - Метаданные шаблона
 */
function getTemplateInfo() {
    return {
        version: '01.05',
        title: 'Пояснительная записка к проектной документации (схема 01.05)',
        description: 'Актуальная схема Минстроя РФ для пояснительных записок (с марта 2025)',
        namespace: 'http://fgistp.economy.gov.ru/explanatory-note/01.05',
        supportedSections: ['general_info', 'object_info', 'technical_characteristics'],
        createdAt: '2025-01-29',
        lastModified: new Date().toISOString()
    };
}

module.exports = {
    generate,
    escapeXML,
    getTemplateInfo
};