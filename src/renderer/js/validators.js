/**
 * @file validators.js
 * @description Validation functions for form fields
 * @module renderer/validators
 */

/**
 * Validators class
 * Contains validation functions for various field types
 */
class Validators {
  /**
   * Validate required field
   * @param {string} value - Field value
   * @returns {string|null} - Error message or null if valid
   */
  static required(value) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Это поле обязательно для заполнения';
    }
    return null;
  }

  /**
   * Validate email address
   * @param {string} value - Email value
   * @returns {string|null} - Error message or null if valid
   */
  static email(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Введите корректный email адрес';
    }

    return null;
  }

  /**
   * Validate phone number
   * @param {string} value - Phone value
   * @returns {string|null} - Error message or null if valid
   */
  static phone(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    // Remove all non-digit characters for validation
    const digits = value.replace(/\D/g, '');

    // Russian phone numbers: 10-11 digits
    // International: allow up to 15 digits
    if (digits.length < 10 || digits.length > 15) {
      return 'Введите корректный номер телефона (10-15 цифр)';
    }

    return null;
  }

  /**
   * Validate INN (Individual Taxpayer Number)
   * Supports both 10-digit (legal entities) and 12-digit (individuals)
   * @param {string} value - INN value
   * @returns {string|null} - Error message or null if valid
   */
  static inn(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const inn = value.trim().replace(/\D/g, '');

    // INN must be 10 or 12 digits
    if (inn.length !== 10 && inn.length !== 12) {
      return 'ИНН должен содержать 10 цифр (для юр. лиц) или 12 цифр (для физ. лиц)';
    }

    // Validate checksum
    if (inn.length === 10) {
      return Validators.validateInn10(inn);
    } else if (inn.length === 12) {
      return Validators.validateInn12(inn);
    }

    return null;
  }

  /**
   * Validate 10-digit INN (legal entities)
   * @private
   * @param {string} inn - 10-digit INN
   * @returns {string|null} - Error message or null if valid
   */
  static validateInn10(inn) {
    const coefficients = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(inn[i]) * coefficients[i];
    }

    const checksum = (sum % 11) % 10;

    if (checksum !== parseInt(inn[9])) {
      return 'Неверная контрольная сумма ИНН';
    }

    return null;
  }

  /**
   * Validate 12-digit INN (individuals)
   * @private
   * @param {string} inn - 12-digit INN
   * @returns {string|null} - Error message or null if valid
   */
  static validateInn12(inn) {
    const coefficients1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const coefficients2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

    // First checksum
    let sum1 = 0;
    for (let i = 0; i < 10; i++) {
      sum1 += parseInt(inn[i]) * coefficients1[i];
    }
    const checksum1 = (sum1 % 11) % 10;

    if (checksum1 !== parseInt(inn[10])) {
      return 'Неверная контрольная сумма ИНН (первая цифра)';
    }

    // Second checksum
    let sum2 = 0;
    for (let i = 0; i < 11; i++) {
      sum2 += parseInt(inn[i]) * coefficients2[i];
    }
    const checksum2 = (sum2 % 11) % 10;

    if (checksum2 !== parseInt(inn[11])) {
      return 'Неверная контрольная сумма ИНН (вторая цифра)';
    }

    return null;
  }

  /**
   * Validate OGRN (Primary State Registration Number)
   * Supports both 13-digit (legal entities) and 15-digit (individual entrepreneurs)
   * @param {string} value - OGRN value
   * @returns {string|null} - Error message or null if valid
   */
  static ogrn(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const ogrn = value.trim().replace(/\D/g, '');

    // OGRN must be 13 or 15 digits
    if (ogrn.length !== 13 && ogrn.length !== 15) {
      return 'ОГРН должен содержать 13 цифр (для юр. лиц) или 15 цифр (для ИП - ОГРНИП)';
    }

    // Validate checksum
    if (ogrn.length === 13) {
      return Validators.validateOgrn13(ogrn);
    } else if (ogrn.length === 15) {
      return Validators.validateOgrn15(ogrn);
    }

    return null;
  }

  /**
   * Validate 13-digit OGRN (legal entities)
   * @private
   * @param {string} ogrn - 13-digit OGRN
   * @returns {string|null} - Error message or null if valid
   */
  static validateOgrn13(ogrn) {
    const base = ogrn.substring(0, 12);
    const checksum = parseInt(ogrn[12]);
    const calculatedChecksum = parseInt(base) % 11;
    const finalChecksum = calculatedChecksum === 10 ? 0 : calculatedChecksum;

    if (finalChecksum !== checksum) {
      return 'Неверная контрольная сумма ОГРН';
    }

    return null;
  }

  /**
   * Validate 15-digit OGRNIP (individual entrepreneurs)
   * @private
   * @param {string} ogrn - 15-digit OGRNIP
   * @returns {string|null} - Error message or null if valid
   */
  static validateOgrn15(ogrn) {
    const base = ogrn.substring(0, 14);
    const checksum = parseInt(ogrn[14]);
    const calculatedChecksum = parseInt(base) % 13;
    const finalChecksum = calculatedChecksum === 10 ? 0 : calculatedChecksum;

    if (finalChecksum !== checksum) {
      return 'Неверная контрольная сумма ОГРНИП';
    }

    return null;
  }

  /**
   * Validate SNILS (Insurance Number of Individual Ledger Account)
   * Format: XXX-XXX-XXX YY (11 digits total)
   * @param {string} value - SNILS value
   * @returns {string|null} - Error message or null if valid
   */
  static snils(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const snils = value.trim().replace(/\D/g, '');

    // SNILS must be 11 digits
    if (snils.length !== 11) {
      return 'СНИЛС должен содержать 11 цифр';
    }

    // SNILS cannot be all zeros
    if (snils === '00000000000') {
      return 'Некорректный СНИЛС';
    }

    // Validate checksum
    const checksum = parseInt(snils.substring(9, 11));
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += parseInt(snils[i]) * (9 - i);
    }

    let calculatedChecksum = sum;

    if (calculatedChecksum === 100 || calculatedChecksum === 101) {
      calculatedChecksum = 0;
    } else if (calculatedChecksum > 101) {
      calculatedChecksum = calculatedChecksum % 101;
      if (calculatedChecksum === 100) {
        calculatedChecksum = 0;
      }
    }

    if (calculatedChecksum !== checksum) {
      return 'Неверная контрольная сумма СНИЛС';
    }

    return null;
  }

  /**
   * Validate cadastral number
   * Format: XX:XX:XXXXXXX:XXXX or variations
   * @param {string} value - Cadastral number
   * @returns {string|null} - Error message or null if valid
   */
  static cadastral(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    // Cadastral number format: AA:BB:CCCCCCC:DDDD
    // where A, B, C, D are digits
    const cadastralRegex = /^\d{2}:\d{2}:\d{6,7}:\d{1,}$/;

    if (!cadastralRegex.test(value.trim())) {
      return 'Введите кадастровый номер в формате XX:XX:XXXXXXX:XXXX';
    }

    return null;
  }

  /**
   * Validate number in range
   * @param {string|number} value - Number value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {string|null} - Error message or null if valid
   */
  static numberRange(value, min, max) {
    if (!value && value !== 0) {
      return null; // Empty is valid unless required
    }

    const num = typeof value === 'number' ? value : parseFloat(value);

    if (isNaN(num)) {
      return 'Введите корректное число';
    }

    if (min !== null && num < min) {
      return `Значение должно быть не меньше ${min}`;
    }

    if (max !== null && num > max) {
      return `Значение должно быть не больше ${max}`;
    }

    return null;
  }

  /**
   * Validate string length
   * @param {string} value - String value
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @returns {string|null} - Error message or null if valid
   */
  static stringLength(value, minLength, maxLength) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const length = value.trim().length;

    if (minLength !== null && length < minLength) {
      return `Минимальная длина: ${minLength} символов`;
    }

    if (maxLength !== null && length > maxLength) {
      return `Максимальная длина: ${maxLength} символов`;
    }

    return null;
  }

  /**
   * Validate pattern (regex)
   * @param {string} value - Value to validate
   * @param {string|RegExp} pattern - Regex pattern
   * @returns {string|null} - Error message or null if valid
   */
  static pattern(value, pattern) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    if (!regex.test(value.trim())) {
      return 'Значение не соответствует требуемому формату';
    }

    return null;
  }

  /**
   * Validate date
   * @param {string} value - Date value
   * @returns {string|null} - Error message or null if valid
   */
  static date(value) {
    if (!value || !value.trim()) {
      return null; // Empty is valid unless required
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return 'Введите корректную дату';
    }

    return null;
  }

  /**
   * Validate field based on validation type
   * @param {string} value - Field value
   * @param {string} validationType - Type of validation (inn, ogrn, snils, etc.)
   * @param {Object} options - Additional validation options
   * @returns {string|null} - Error message or null if valid
   */
  static validate(value, validationType, options = {}) {
    switch (validationType) {
      case 'required':
        return Validators.required(value);

      case 'email':
        return Validators.email(value);

      case 'phone':
        return Validators.phone(value);

      case 'inn':
        return Validators.inn(value);

      case 'ogrn':
        return Validators.ogrn(value);

      case 'snils':
        return Validators.snils(value);

      case 'cadastral':
        return Validators.cadastral(value);

      case 'date':
        return Validators.date(value);

      case 'numberRange':
        return Validators.numberRange(value, options.min, options.max);

      case 'stringLength':
        return Validators.stringLength(value, options.minLength, options.maxLength);

      case 'pattern':
        return Validators.pattern(value, options.pattern);

      default:
        console.warn(`Unknown validation type: ${validationType}`);
        return null;
    }
  }

  /**
   * Validate multiple rules for a field
   * @param {string} value - Field value
   * @param {Array<Object>} rules - Array of validation rules
   * @returns {Array<string>} - Array of error messages
   */
  static validateMultiple(value, rules) {
    const errors = [];

    for (const rule of rules) {
      const error = Validators.validate(value, rule.type, rule.options);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  /**
   * Format INN for display
   * @param {string} inn - INN value
   * @returns {string} - Formatted INN
   */
  static formatInn(inn) {
    if (!inn) return '';
    const digits = inn.replace(/\D/g, '');
    return digits;
  }

  /**
   * Format OGRN for display
   * @param {string} ogrn - OGRN value
   * @returns {string} - Formatted OGRN
   */
  static formatOgrn(ogrn) {
    if (!ogrn) return '';
    const digits = ogrn.replace(/\D/g, '');
    return digits;
  }

  /**
   * Format SNILS for display
   * @param {string} snils - SNILS value
   * @returns {string} - Formatted SNILS (XXX-XXX-XXX YY)
   */
  static formatSnils(snils) {
    if (!snils) return '';
    const digits = snils.replace(/\D/g, '');

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;

    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)} ${digits.slice(9, 11)}`;
  }

  /**
   * Format phone for display
   * @param {string} phone - Phone value
   * @returns {string} - Formatted phone
   */
  static formatPhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');

    // Russian format: +7 (XXX) XXX-XX-XX
    if (digits.length === 11 && digits[0] === '7') {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }

    // Default format
    return `+${digits}`;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validators;
}
