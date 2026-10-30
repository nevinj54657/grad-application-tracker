import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SavedJobForm from '../components/SavedJobForm';
import Alert from '../components/Alert';
import { EMPLOYMENT_TYPES, formatDate, daysUntil, labelFor } from '../constants';

function DeadlineBadge({ deadline }) {
  if (!deadline) return <span className="text-slate-400">No deadline</span>;
  const days = daysUntil(deadline);
  const label = `${formatDate(deadline)} (${days < 0 ? 'past' : `${days}d`})`;
  const color = days < 0 ? 'text-slate-400' : days <= 3 ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-slate-600';
  return <span className={color}>{label}</span>;
}

function SavedJobs() {
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [sort, setSort] = useState('createdAt');

  const [modalJob, setModalJob] = useState(null); // null = closed, {} = new, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/saved-jobs', { search, employmentType, sort });
      setSavedJobs(data.savedJobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, employmentType, sort]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  const handleSave = async (form) => {
    const payload = {
      ...form,
      salary: form.salary || undefined,
      location: form.location || undefined,
      employmentType: form.employmentType || undefined,
      jobUrl: form.jobUrl || undefined,
      deadline: form.deadline || undefined,
      notes: form.notes || undefined,
    };

    if (modalJob?.id) {
      const data = await api.patch(`/saved-jobs/${modalJob.id}`, payload);
      setSavedJobs((prev) => prev.map((job) => (job.id === modalJob.id ? data.savedJob : job)));
      setSuccess('Saved job updated successfully.');
    } else {
      const data = await api.post('/saved-jobs', payload);
      setSavedJobs((prev) => [data.savedJob, ...prev]);
      setSuccess('Saved job added successfully.');
    }
    setModalJob(null);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/saved-jobs/${deleteTarget.id}`);
      setSavedJobs((prev) => prev.filter((job) => job.id !== deleteTarget.id));
      setSuccess('Saved job deleted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  const handleConvert = async () => {
    setBusy(true);
    try {
      const data = await api.post(`/saved-jobs/${convertTarget.id}/apply`);
      setSavedJobs((prev) => prev.filter((job) => job.id !== convertTarget.id));
      setConvertTarget(null);
      navigate(`/applications/${data.application.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <button
          type="button"
          onClick={() => setModalJob({})}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Saved Job
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search company, title, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All employment types</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Sort by date added</option>
          <option value="deadline">Sort by deadline</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading saved jobs...</p>
      ) : savedJobs.length === 0 ? (
        <p className="mt-6 text-slate-500">No saved jobs yet. Add one to get started.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => (
            <div key={job.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{job.jobTitle}</h3>
                  <p className="text-sm text-slate-600">{job.company}</p>
                </div>
                {job.employmentType && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {labelFor(EMPLOYMENT_TYPES, job.employmentType)}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-sm text-slate-500">
                {job.location && <p>{job.location}</p>}
                {job.salary && <p>{job.salary}</p>}
                <p>
                  Deadline: <DeadlineBadge deadline={job.deadline} />
                </p>
              </div>

              {job.jobUrl && (
                <a href={job.jobUrl} target="_blank" rel="noreferrer" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
                  View listing ↗
                </a>
              )}

              <div className="mt-auto flex flex-wrap gap-2 pt-4 text-sm">
                <button type="button" onClick={() => setConvertTarget(job)} className="rounded-md bg-green-600 px-3 py-1.5 font-medium text-white hover:bg-green-700">
                  Convert to Application
                </button>
                <button type="button" onClick={() => setModalJob(job)} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                  Edit
                </button>
                <button type="button" onClick={() => setDeleteTarget(job)} className="rounded-md border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalJob !== null && (
        <Modal title={modalJob.id ? 'Edit Saved Job' : 'Add Saved Job'} onClose={() => setModalJob(null)}>
          <SavedJobForm savedJob={modalJob.id ? modalJob : null} onSubmit={handleSave} onCancel={() => setModalJob(null)} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete saved job?"
          message={`This will permanently delete "${deleteTarget.jobTitle}" at ${deleteTarget.company}.`}
          confirmLabel={busy ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {convertTarget && (
        <ConfirmDialog
          title="Convert to application?"
          message={`This will create an application for "${convertTarget.jobTitle}" at ${convertTarget.company} and remove it from your saved jobs.`}
          confirmLabel={busy ? 'Converting...' : 'Convert'}
          danger={false}
          onConfirm={handleConvert}
          onCancel={() => setConvertTarget(null)}
        />
      )}
    </div>
  );
}

export default SavedJobs;
