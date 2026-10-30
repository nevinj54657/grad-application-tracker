import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ApplicationForm from '../components/ApplicationForm';
import InterviewForm from '../components/InterviewForm';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import useTags from '../hooks/useTags';
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES, INTERVIEW_TYPES, INTERVIEW_OUTCOMES, labelFor, formatDate } from '../constants';

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tags, createTag } = useTags();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [interviewModal, setInterviewModal] = useState(null); // null closed, {} new, object edit
  const [deleteInterviewTarget, setDeleteInterviewTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/applications/${id}`);
      setApplication(data.application);
      setNotes(data.application.notes || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setBusy(true);
    try {
      const data = await api.patch(`/applications/${id}/status`, { status: newStatus });
      setApplication(data.application);
      const historyData = await api.get(`/applications/${id}/history`);
      setApplication((prev) => ({ ...prev, history: historyData.history }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleEditSubmit = async (form) => {
    const payload = {
      ...form,
      salary: form.salary || undefined,
      location: form.location || undefined,
      employmentType: form.employmentType || undefined,
      jobUrl: form.jobUrl || undefined,
      deadline: form.deadline || undefined,
      dateApplied: form.dateApplied || undefined,
    };
    const data = await api.patch(`/applications/${id}`, payload);
    setApplication((prev) => ({ ...prev, ...data.application, history: prev.history, interviews: prev.interviews }));
    setNotes(data.application.notes || '');
    setEditing(false);
    setSuccess('Application updated successfully.');
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/applications/${id}`);
      navigate('/applications');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const data = await api.patch(`/applications/${id}`, { notes });
      setApplication((prev) => ({ ...prev, notes: data.application.notes }));
      setSuccess('Notes saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleInterviewSubmit = async (form) => {
    if (interviewModal?.id) {
      const data = await api.patch(`/interviews/${interviewModal.id}`, form);
      setApplication((prev) => ({
        ...prev,
        interviews: prev.interviews.map((iv) => (iv.id === interviewModal.id ? data.interview : iv)),
      }));
      setSuccess('Interview updated successfully.');
    } else {
      const data = await api.post(`/applications/${id}/interviews`, form);
      setApplication((prev) => ({ ...prev, interviews: [...prev.interviews, data.interview] }));
      setSuccess('Interview added successfully.');
    }
    setInterviewModal(null);
  };

  const handleDeleteInterview = async () => {
    setBusy(true);
    try {
      await api.delete(`/interviews/${deleteInterviewTarget.id}`);
      setApplication((prev) => ({
        ...prev,
        interviews: prev.interviews.filter((iv) => iv.id !== deleteInterviewTarget.id),
      }));
      setSuccess('Interview deleted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setDeleteInterviewTarget(null);
    }
  };

  if (loading) return <p className="text-slate-500">Loading application...</p>;
  if (error && !application) return <Alert type="error">{error}</Alert>;
  if (!application) return null;

  return (
    <div>
      <Link to="/applications" className="text-sm text-blue-600 hover:underline">
        ← Back to Applications
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{application.jobTitle}</h1>
          <p className="text-slate-600">{application.company}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(true)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Edit
          </button>
          <button type="button" onClick={() => setDeleting(true)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {application.tags.map((tag) => (
          <span key={tag.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {tag.name}
          </span>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Job Information</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Location</dt><dd className="text-slate-900">{application.location || '—'}</dd></div>
              <div><dt className="text-slate-500">Employment Type</dt><dd className="text-slate-900">{application.employmentType ? labelFor(EMPLOYMENT_TYPES, application.employmentType) : '—'}</dd></div>
              <div><dt className="text-slate-500">Salary</dt><dd className="text-slate-900">{application.salary || '—'}</dd></div>
              <div><dt className="text-slate-500">Deadline</dt><dd className="text-slate-900">{formatDate(application.deadline)}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Job URL</dt>
                <dd>
                  {application.jobUrl ? (
                    <a href={application.jobUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {application.jobUrl}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about this application..."
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Interviews</h2>
              <button type="button" onClick={() => setInterviewModal({})} className="text-sm font-medium text-blue-600 hover:underline">
                + Add Interview
              </button>
            </div>
            {application.interviews.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No interviews scheduled yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {application.interviews.map((iv) => (
                  <div key={iv.id} className="rounded-md border border-slate-200 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{labelFor(INTERVIEW_TYPES, iv.type)} interview</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{labelFor(INTERVIEW_OUTCOMES, iv.outcome)}</span>
                    </div>
                    <p className="text-slate-500">{formatDateTime(iv.scheduledAt)}</p>
                    {iv.location && <p className="text-slate-500">{iv.location}</p>}
                    {iv.meetingUrl && (
                      <a href={iv.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Join meeting ↗
                      </a>
                    )}
                    {iv.notes && <p className="mt-1 text-slate-600">{iv.notes}</p>}
                    <div className="mt-2 flex gap-3">
                      <button type="button" onClick={() => setInterviewModal(iv)} className="text-xs font-medium text-slate-600 hover:text-blue-600">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteInterviewTarget(iv)} className="text-xs font-medium text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Application Status</h2>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={application.status} />
            </div>
            <label htmlFor="status" className="mt-3 block text-sm font-medium text-slate-700">
              Change status
            </label>
            <select
              id="status"
              value={application.status}
              onChange={handleStatusChange}
              disabled={busy}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm text-slate-500">Date Applied: {formatDate(application.dateApplied)}</p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">History</h2>
            <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4 text-sm">
              {application.history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <p className="font-medium text-slate-900">{labelFor(APPLICATION_STATUSES, h.status)}</p>
                  <p className="text-slate-500">{formatDateTime(h.changedAt)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {editing && (
        <Modal title="Edit Application" onClose={() => setEditing(false)}>
          <ApplicationForm application={application} tags={tags} onCreateTag={createTag} onSubmit={handleEditSubmit} onCancel={() => setEditing(false)} />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete application?"
          message={`This will permanently delete "${application.jobTitle}" at ${application.company}, including its history and interviews.`}
          confirmLabel={busy ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(false)}
        />
      )}

      {interviewModal !== null && (
        <Modal title={interviewModal.id ? 'Edit Interview' : 'Add Interview'} onClose={() => setInterviewModal(null)}>
          <InterviewForm interview={interviewModal.id ? interviewModal : null} onSubmit={handleInterviewSubmit} onCancel={() => setInterviewModal(null)} />
        </Modal>
      )}

      {deleteInterviewTarget && (
        <ConfirmDialog
          title="Delete interview?"
          message="This will permanently delete this interview."
          confirmLabel={busy ? 'Deleting...' : 'Delete'}
          onConfirm={handleDeleteInterview}
          onCancel={() => setDeleteInterviewTarget(null)}
        />
      )}
    </div>
  );
}

export default ApplicationDetails;
