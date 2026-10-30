const { isOptionalString, isOptionalUrl, isValidEnum } = require('./validators');

const INTERVIEW_TYPES = ['HR', 'TECHNICAL', 'CODING', 'ASSESSMENT_CENTRE', 'FINAL', 'OTHER'];
const INTERVIEW_OUTCOMES = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'];

function validateInterviewFields(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  if (!partial || body.type !== undefined) {
    if (!INTERVIEW_TYPES.includes(body.type)) {
      errors.type = 'Please select a valid interview type.';
    } else {
      data.type = body.type;
    }
  }

  if (!partial || body.scheduledAt !== undefined) {
    const date = new Date(body.scheduledAt);
    if (!body.scheduledAt || Number.isNaN(date.getTime())) {
      errors.scheduledAt = 'Please enter a valid interview date and time.';
    } else {
      data.scheduledAt = date;
    }
  }

  if (!partial || body.location !== undefined) {
    if (!isOptionalString(body.location, { maxLength: 200 })) {
      errors.location = 'Location is too long.';
    } else {
      data.location = body.location ? body.location.trim() : null;
    }
  }

  if (!partial || body.meetingUrl !== undefined) {
    if (!isOptionalUrl(body.meetingUrl)) {
      errors.meetingUrl = 'Please enter a valid URL starting with http:// or https://.';
    } else {
      data.meetingUrl = body.meetingUrl ? body.meetingUrl.trim() : null;
    }
  }

  if (!partial || body.notes !== undefined) {
    if (!isOptionalString(body.notes, { maxLength: 5000 })) {
      errors.notes = 'Notes are too long.';
    } else {
      data.notes = body.notes ? body.notes.trim() : null;
    }
  }

  if (body.outcome !== undefined) {
    if (!isValidEnum(body.outcome, INTERVIEW_OUTCOMES)) {
      errors.outcome = 'Please select a valid outcome.';
    } else if (body.outcome) {
      data.outcome = body.outcome;
    }
  }

  return { errors, data };
}

module.exports = { validateInterviewFields, INTERVIEW_TYPES, INTERVIEW_OUTCOMES };
