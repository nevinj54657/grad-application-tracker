import { useState } from 'react';
import FormField from './FormField';
import Alert from './Alert';
import { EMPLOYMENT_TYPES, toDateInputValue } from '../constants';

const EMPLOYMENT_TYPE_OPTIONS = [{ value: '', label: 'Select type...' }, ...EMPLOYMENT_TYPES];

function emptyForm(savedJob) {
  return {
    company: savedJob?.company || '',
    jobTitle: savedJob?.jobTitle || '',
    location: savedJob?.location || '',
    employmentType: savedJob?.employmentType || '',
    salary: savedJob?.salary || '',
    jobUrl: savedJob?.jobUrl || '',
    deadline: toDateInputValue(savedJob?.deadline),
    notes: savedJob?.notes || '',
  };
}

function SavedJobForm({ savedJob, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => emptyForm(savedJob));
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

    if (!form.company.trim() || !form.jobTitle.trim()) {
      setFieldErrors({
        ...(!form.company.trim() && { company: 'Company is required.' }),
        ...(!form.jobTitle.trim() && { jobTitle: 'Job title is required.' }),
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
        <FormField label="Company" name="company" value={form.company} onChange={handleChange} error={fieldErrors.company} required />
        <FormField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} error={fieldErrors.jobTitle} required />
        <FormField label="Location" name="location" value={form.location} onChange={handleChange} error={fieldErrors.location} />
        <FormField
          label="Employment Type"
          name="employmentType"
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={form.employmentType}
          onChange={handleChange}
          error={fieldErrors.employmentType}
        />
        <FormField label="Salary" name="salary" value={form.salary} onChange={handleChange} error={fieldErrors.salary} placeholder="e.g. £30,000" />
        <FormField label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} error={fieldErrors.deadline} />
      </div>

      <FormField label="Job URL" name="jobUrl" type="url" value={form.jobUrl} onChange={handleChange} error={fieldErrors.jobUrl} placeholder="https://..." />
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

export default SavedJobForm;
