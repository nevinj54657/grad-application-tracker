export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'PLACEMENT', label: 'Placement' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'OTHER', label: 'Other' },
];

export const APPLICATION_STATUSES = [
  { value: 'SAVED', label: 'Saved' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'ONLINE_ASSESSMENT', label: 'Online Assessment' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export const KANBAN_STATUSES = APPLICATION_STATUSES.filter((s) => s.value !== 'WITHDRAWN');

export const INTERVIEW_TYPES = [
  { value: 'HR', label: 'HR' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'CODING', label: 'Coding' },
  { value: 'ASSESSMENT_CENTRE', label: 'Assessment Centre' },
  { value: 'FINAL', label: 'Final' },
  { value: 'OTHER', label: 'Other' },
];

export const INTERVIEW_OUTCOMES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PASSED', label: 'Passed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label || value || '—';
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function toDateInputValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function daysUntil(value) {
  if (!value) return null;
  const now = new Date();
  const target = new Date(value);
  const diffMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
