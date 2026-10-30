// Small hand-rolled validation helpers. Keeping this dependency-free is fine
// for the size of this project — a schema validation library would be
// overkill for the handful of fields each endpoint accepts.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s]+$/i;

function isNonEmptyString(value, { maxLength = 255 } = {}) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 255 && EMAIL_REGEX.test(value);
}

function isValidPassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

function isOptionalString(value, { maxLength = 255 } = {}) {
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.length <= maxLength);
}

function isOptionalUrl(value) {
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.length <= 2048 && URL_REGEX.test(value));
}

function isOptionalDate(value) {
  if (value === undefined || value === null || value === '') return true;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidEnum(value, allowed) {
  return value === undefined || value === null || value === '' || allowed.includes(value);
}

function isPositiveIntId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isOptionalString,
  isOptionalUrl,
  isOptionalDate,
  isValidEnum,
  isPositiveIntId,
};
