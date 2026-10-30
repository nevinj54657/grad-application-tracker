import { useState } from 'react';
import FormField from './FormField';
import Alert from './Alert';
import { INTERVIEW_TYPES, INTERVIEW_OUTCOMES } from '../constants';

const TYPE_OPTIONS = [{ value: '', label: 'Select type...' }, ...INTERVIEW_TYPES];

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function emptyForm(interview) {
  return {
    type: interview?.type || '',
    scheduledAt: toDateTimeLocal(interview?.scheduledAt),
    location: interview?.location || '',
    meetingUrl: interview?.meetingUrl || '',
    notes: interview?.notes || '',
    outcome: interview?.outcome || 'PENDING',
  };
}

function InterviewForm({ interview, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => emptyForm(interview));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    if (!form.type || !form.scheduledAt) {
      setFieldErrors({
        ...(!form.type && { type: 'Interview type is required.' }),
        ...(!form.scheduledAt && { scheduledAt: 'Date and time are required.' }),
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setFormError(err.message);
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Alert type="error">{formError}</Alert>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Type" name="type" options={TYPE_OPTIONS} value={form.type} onChange={handleChange} error={fieldErrors.type} required />
        <FormField label="Date & Time" name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={handleChange} error={fieldErrors.scheduledAt} required />
        <FormField label="Location" name="location" value={form.location} onChange={handleChange} error={fieldErrors.location} placeholder="Office / Remote" />
        <FormField label="Outcome" name="outcome" options={INTERVIEW_OUTCOMES} value={form.outcome} onChange={handleChange} error={fieldErrors.outcome} />
      </div>

      <FormField label="Meeting URL" name="meetingUrl" type="url" value={form.meetingUrl} onChange={handleChange} error={fieldErrors.meetingUrl} placeholder="https://..." />
      <FormField label="Notes" name="notes" textarea value={form.notes} onChange={handleChange} error={fieldErrors.notes} />

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default InterviewForm;
