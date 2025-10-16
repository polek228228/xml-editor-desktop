/**
 * @file validators/index.js
 * @description Валидаторы для российских идентификаторов и специфических полей
 * Соответствует официальным требованиям ФНС, ПФР, Росреестра
 */

/**
 * Валидация ИНН (Индивидуальный номер налогоплательщика)
 * 10 цифр для юридических лиц, 12 цифр для физических лиц
 * @param {string} inn - ИНН для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateINN = (inn) => {
  if (!inn) {
    return { valid: false, error: 'ИНН не может быть пустым' };
  }

  // Удаляем пробелы
  const cleaned = inn.replace(/\s/g, '');

  // Проверка длины (10 или 12 цифр)
  if (!/^\d{10}$|^\d{12}$/.test(cleaned)) {
    return { valid: false, error: 'ИНН должен состоять из 10 (юр. лицо) или 12 (физ. лицо) цифр' };
  }

  // Проверка контрольной суммы для 10-значного ИНН
  if (cleaned.length === 10) {
    const coefficients = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * coefficients[i];
    }
    const checksum = (sum % 11) % 10;
    if (checksum !== parseInt(cleaned[9])) {
      return { valid: false, error: 'Неверная контрольная сумма ИНН' };
    }
  }

  // Проверка контрольных сумм для 12-значного ИНН
  if (cleaned.length === 12) {
    // Проверка 11-го знака
    const coefficients11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum11 = 0;
    for (let i = 0; i < 10; i++) {
      sum11 += parseInt(cleaned[i]) * coefficients11[i];
    }
    const checksum11 = (sum11 % 11) % 10;
    if (checksum11 !== parseInt(cleaned[10])) {
      return { valid: false, error: 'Неверная контрольная сумма ИНН (11-й знак)' };
    }

    // Проверка 12-го знака
    const coefficients12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum12 = 0;
    for (let i = 0; i < 11; i++) {
      sum12 += parseInt(cleaned[i]) * coefficients12[i];
    }
    const checksum12 = (sum12 % 11) % 10;
    if (checksum12 !== parseInt(cleaned[11])) {
      return { valid: false, error: 'Неверная контрольная сумма ИНН (12-й знак)' };
    }
  }

  return { valid: true, error: null };
};

/**
 * Валидация ОГРН (Основной государственный регистрационный номер)
 * 13 цифр для юридических лиц, 15 цифр для ИП (ОГРНИП)
 * @param {string} ogrn - ОГРН для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateOGRN = (ogrn) => {
  if (!ogrn) {
    return { valid: false, error: 'ОГРН не может быть пустым' };
  }

  // Удаляем пробелы
  const cleaned = ogrn.replace(/\s/g, '');

  // Проверка длины (13 или 15 цифр)
  if (!/^\d{13}$|^\d{15}$/.test(cleaned)) {
    return { valid: false, error: 'ОГРН должен состоять из 13 (юр. лицо) или 15 (ИП) цифр' };
  }

  // Проверка контрольной суммы для 13-значного ОГРН
  if (cleaned.length === 13) {
    const base = cleaned.substring(0, 12);
    const checksum = parseInt(cleaned[12]);
    const calculated = parseInt(base) % 11;
    const expected = calculated === 10 ? 0 : calculated;

    if (expected !== checksum) {
      return { valid: false, error: 'Неверная контрольная сумма ОГРН' };
    }
  }

  // Проверка контрольной суммы для 15-значного ОГРНИП
  if (cleaned.length === 15) {
    const base = cleaned.substring(0, 14);
    const checksum = parseInt(cleaned[14]);
    const calculated = parseInt(base) % 13;
    const expected = calculated === 10 ? 0 : calculated;

    if (expected !== checksum) {
      return { valid: false, error: 'Неверная контрольная сумма ОГРНИП' };
    }
  }

  return { valid: true, error: null };
};

/**
 * Валидация СНИЛС (Страховой номер индивидуального лицевого счёта)
 * Формат: XXX-XXX-XXX YY (11 цифр с контрольной суммой)
 * @param {string} snils - СНИЛС для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateSNILS = (snils) => {
  if (!snils) {
    return { valid: false, error: 'СНИЛС не может быть пустым' };
  }

  // Удаляем пробелы и дефисы
  const cleaned = snils.replace(/[\s-]/g, '');

  // Проверка длины (11 цифр)
  if (!/^\d{11}$/.test(cleaned)) {
    return { valid: false, error: 'СНИЛС должен состоять из 11 цифр (формат: XXX-XXX-XXX YY)' };
  }

  // Проверка контрольной суммы
  const digits = cleaned.substring(0, 9);
  const checksum = parseInt(cleaned.substring(9, 11));

  // СНИЛС меньше 001-001-998 не используются
  if (parseInt(digits) < 1001998) {
    return { valid: false, error: 'Недопустимый номер СНИЛС' };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (9 - i);
  }

  let expected = sum;
  if (expected === 100 || expected === 101) {
    expected = 0;
  } else if (expected > 101) {
    expected = expected % 101;
    if (expected === 100) {
      expected = 0;
    }
  }

  if (expected !== checksum) {
    return { valid: false, error: 'Неверная контрольная сумма СНИЛС' };
  }

  return { valid: true, error: null };
};

/**
 * Валидация кадастрового номера земельного участка
 * Формат: AA:BB:CCCCCCC:DD (где AA - код субъекта РФ, BB - кадастровый округ, etc.)
 * Общий формат: \d{2}:\d{2}:\d{6,7}:\d{1,}
 * @param {string} cadastral - Кадастровый номер для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateCadastralNumber = (cadastral) => {
  if (!cadastral) {
    return { valid: false, error: 'Кадастровый номер не может быть пустым' };
  }

  // Формат: XX:YY:ZZZZZZZ:KKK
  const pattern = /^\d{2}:\d{2}:\d{6,7}:\d{1,}$/;

  if (!pattern.test(cadastral)) {
    return { valid: false, error: 'Неверный формат кадастрового номера (ожидается: XX:YY:ZZZZZZZ:KKK)' };
  }

  // Проверка кода субъекта РФ (первые 2 цифры)
  const regionCode = cadastral.substring(0, 2);
  const validRegions = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
    '51', '52', '53', '54', '55', '56', '57', '58', '59', '60',
    '61', '62', '63', '64', '65', '66', '67', '68', '69', '70',
    '71', '72', '73', '74', '75', '76', '77', '78', '79',
    '83', '86', '87', '89', '91', '92'
  ];

  if (!validRegions.includes(regionCode)) {
    return { valid: false, error: `Неверный код субъекта РФ: ${regionCode}` };
  }

  return { valid: true, error: null };
};

/**
 * Валидация xs:ID (XML идентификатор)
 * Требования: начинается с буквы или _, содержит только буквы, цифры, _, -, .
 * Не может содержать пробелы и специальные символы
 * @param {string} id - Идентификатор для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateXmlID = (id) => {
  if (!id) {
    return { valid: false, error: 'ID не может быть пустым' };
  }

  // xs:ID должен начинаться с буквы или подчеркивания
  // и содержать только буквы, цифры, _, -, .
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_.-]*$/;

  if (!pattern.test(id)) {
    return {
      valid: false,
      error: 'ID должен начинаться с буквы или "_" и содержать только буквы, цифры, "_", "-", "."'
    };
  }

  return { valid: true, error: null };
};

/**
 * Валидация года (tYear в XSD)
 * Требования: 4-значное число от 1900 до 2100
 * @param {number|string} year - Год для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateYear = (year) => {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;

  if (isNaN(yearNum)) {
    return { valid: false, error: 'Год должен быть числом' };
  }

  if (yearNum < 1900 || yearNum > 2100) {
    return { valid: false, error: 'Год должен быть в диапазоне 1900-2100' };
  }

  if (!/^\d{4}$/.test(String(yearNum))) {
    return { valid: false, error: 'Год должен быть 4-значным числом' };
  }

  return { valid: true, error: null };
};

/**
 * Валидация телефонного номера
 * Формат: +7XXXXXXXXXX или 8XXXXXXXXXX (10 цифр после кода)
 * @param {string} phone - Телефон для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, error: 'Телефон не может быть пустым' };
  }

  // Удаляем все символы кроме цифр и +
  const cleaned = phone.replace(/[\s()-]/g, '');

  // Проверка формата
  const patterns = [
    /^\+7\d{10}$/,  // +7XXXXXXXXXX
    /^8\d{10}$/,    // 8XXXXXXXXXX
    /^7\d{10}$/     // 7XXXXXXXXXX
  ];

  const isValid = patterns.some(pattern => pattern.test(cleaned));

  if (!isValid) {
    return { valid: false, error: 'Неверный формат телефона (ожидается: +7XXXXXXXXXX или 8XXXXXXXXXX)' };
  }

  return { valid: true, error: null };
};

/**
 * Валидация email
 * Простая проверка формата email
 * @param {string} email - Email для проверки
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email не может быть пустым' };
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(email)) {
    return { valid: false, error: 'Неверный формат email' };
  }

  return { valid: true, error: null };
};

/**
 * Валидация десятичного числа с заданной точностью
 * @param {number|string} value - Значение для проверки
 * @param {number} precision - Количество знаков после запятой
 * @param {number} min - Минимальное значение (опционально)
 * @param {number} max - Максимальное значение (опционально)
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateDecimal = (value, precision = 2, min = null, max = null) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { valid: false, error: 'Значение должно быть числом' };
  }

  if (min !== null && numValue < min) {
    return { valid: false, error: `Значение должно быть не меньше ${min}` };
  }

  if (max !== null && numValue > max) {
    return { valid: false, error: `Значение должно быть не больше ${max}` };
  }

  // Проверка количества знаков после запятой
  const parts = String(numValue).split('.');
  if (parts[1] && parts[1].length > precision) {
    return { valid: false, error: `Максимум ${precision} знаков после запятой` };
  }

  return { valid: true, error: null };
};

/**
 * Валидация целого числа в заданном диапазоне
 * @param {number|string} value - Значение для проверки
 * @param {number} min - Минимальное значение (опционально)
 * @param {number} max - Максимальное значение (опционально)
 * @returns {{valid: boolean, error: string|null}}
 */
exports.validateInteger = (value, min = null, max = null) => {
  const intValue = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(intValue) || !Number.isInteger(intValue)) {
    return { valid: false, error: 'Значение должно быть целым числом' };
  }

  if (min !== null && intValue < min) {
    return { valid: false, error: `Значение должно быть не меньше ${min}` };
  }

  if (max !== null && intValue > max) {
    return { valid: false, error: `Значение должно быть не больше ${max}` };
  }

  return { valid: true, error: null };
};

/**
 * Нормализация телефонного номера
 * Конвертирует любой формат в +7XXXXXXXXXX
 * @param {string} phone - Телефон для нормализации
 * @returns {string} - Нормализованный телефон
 */
exports.normalizePhone = (phone) => {
  if (!phone) return '';

  // Удаляем все символы кроме цифр
  const digits = phone.replace(/\D/g, '');

  // Если начинается с 8, заменяем на 7
  let normalized = digits;
  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.substring(1);
  }

  // Убеждаемся что есть +
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  return normalized;
};

/**
 * Форматирование даты в формат XML (YYYY-MM-DD)
 * @param {Date|string} date - Дата для форматирования
 * @returns {string} - Отформатированная дата
 */
exports.formatDate = (date) => {
  if (!date) return '';

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Форматирование десятичного числа
 * @param {number} value - Число для форматирования
 * @param {number} precision - Количество знаков после запятой
 * @returns {string} - Отформатированное число
 */
exports.formatDecimal = (value, precision = 2) => {
  if (value === null || value === undefined) return '';
  return Number(value).toFixed(precision);
};
