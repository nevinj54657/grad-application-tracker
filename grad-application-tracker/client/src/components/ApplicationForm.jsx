import { useState } from 'react';
import FormField from './FormField';
import Alert from './Alert';
import { EMPLOYMENT_TYPES, APPLICATION_STATUSES, toDateInputValue } from '../constants';

const EMPLOYMENT_TYPE_OPTIONS = [{ value: '', label: 'Select type...' }, ...EMPLOYMENT_TYPES];

function emptyForm(application) {
  return {
    company: application?.company || '',
    jobTitle: application?.jobTitle || '',
    location: application?.location || '',
    employmentType: application?.employmentType || '',
    salary: application?.salary || '',
    jobUrl: application?.jobUrl || '',
    deadline: toDateInputValue(application?.deadline),
    dateApplied: toDateInputValue(application?.dateApplied),
    status: application?.status || 'SAVED',
    notes: application?.notes || '',
    tagIds: application?.tags?.map((t) => t.id) || [],
  };
}

function ApplicationForm({ application, tags, onCreateTag, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => emptyForm(application));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleTag = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }));
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await onCreateTag(newTagName.trim());
      setNewTagName('');
      setForm((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }));
    } catch (err) {
      setFormError(err.message);
    }
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
        <FormField label="Status" name="status" options={APPLICATION_STATUSES} value={form.status} onChange={handleChange} error={fieldErrors.status} />
        <FormField label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} error={fieldErrors.deadline} />
        <FormField label="Date Applied" name="dateApplied" type="date" value={form.dateApplied} onChange={handleChange} error={fieldErrors.dateApplied} />
      </div>

      <FormField label="Job URL" name="jobUrl" type="url" value={form.jobUrl} onChange={handleChange} error={fieldErrors.jobUrl} placeholder="https://..." />
      <FormField label="Notes" name="notes" textarea value={form.notes} onChange={handleChange} error={fieldErrors.notes} />

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Tags</span>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                form.tagIds.includes(tag.id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="w-full max-w-xs rounded-md border border-slate-300 px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={handleAddTag} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
            Add tag
          </button>
        </div>
      </div>

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

export default ApplicationForm;
