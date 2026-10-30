// Shared validation for the job-ish fields that both SavedJob and
// Application share (company, title, location, salary, etc).

const {
  isNonEmptyString,
  isOptionalString,
  isOptionalUrl,
  isOptionalDate,
  isValidEnum,
} = require('./validators');

const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'INTERNSHIP',
  'PLACEMENT',
  'GRADUATE',
  'CONTRACT',
  'TEMPORARY',
  'OTHER',
];

// partial = true skips "required" checks for fields not present in the body (used for PATCH).
function validateJobFields(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  if (!partial || body.company !== undefined) {
    if (!isNonEmptyString(body.company, { maxLength: 150 })) {
      errors.company = 'Company is required.';
    } else {
      data.company = body.company.trim();
    }
  }

  if (!partial || body.jobTitle !== undefined) {
    if (!isNonEmptyString(body.jobTitle, { maxLength: 150 })) {
      errors.jobTitle = 'Job title is required.';
    } else {
      data.jobTitle = body.jobTitle.trim();
    }
  }

  if (!partial || body.location !== undefined) {
    if (!isOptionalString(body.location, { maxLength: 150 })) {
      errors.location = 'Location is too long.';
    } else {
      data.location = body.location ? body.location.trim() : null;
    }
  }

  if (!partial || body.employmentType !== undefined) {
    if (!isValidEnum(body.employmentType, EMPLOYMENT_TYPES)) {
      errors.employmentType = 'Please select a valid employment type.';
    } else {
      data.employmentType = body.employmentType || null;
    }
  }

  if (!partial || body.salary !== undefined) {
    if (!isOptionalString(body.salary, { maxLength: 100 })) {
      errors.salary = 'Salary is too long.';
    } else {
      data.salary = body.salary ? body.salary.trim() : null;
    }
  }

  if (!partial || body.jobUrl !== undefined) {
    if (!isOptionalUrl(body.jobUrl)) {
      errors.jobUrl = 'Please enter a valid URL starting with http:// or https://.';
    } else {
      data.jobUrl = body.jobUrl ? body.jobUrl.trim() : null;
    }
  }

  if (!partial || body.deadline !== undefined) {
    if (!isOptionalDate(body.deadline)) {
      errors.deadline = 'Please enter a valid deadline date.';
    } else {
      data.deadline = body.deadline ? new Date(body.deadline) : null;
    }
  }

  if (!partial || body.notes !== undefined) {
    if (!isOptionalString(body.notes, { maxLength: 5000 })) {
      errors.notes = 'Notes are too long.';
    } else {
      data.notes = body.notes ? body.notes.trim() : null;
    }
  }

  return { errors, data };
}

module.exports = { validateJobFields, EMPLOYMENT_TYPES };
