import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ApplicationForm from '../components/ApplicationForm';
import KanbanBoard from '../components/KanbanBoard';
import StatusBadge from '../components/StatusBadge';
import Alert from '../components/Alert';
import useTags from '../hooks/useTags';
import { APPLICATION_STATUSES, EMPLOYMENT_TYPES, formatDate } from '../constants';

function Applications() {
  const { tags, createTag } = useTags();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState('table');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [tagId, setTagId] = useState('');
  const [sort, setSort] = useState('createdAt');

  const [modalApp, setModalApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/applications', { search, status, employmentType, tagId, sort });
      setApplications(data.applications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status, employmentType, tagId, sort]);

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
      dateApplied: form.dateApplied || undefined,
    };

    if (modalApp?.id) {
      const data = await api.patch(`/applications/${modalApp.id}`, payload);
      setApplications((prev) => prev.map((a) => (a.id === modalApp.id ? data.application : a)));
      setSuccess('Application updated successfully.');
    } else {
      const data = await api.post('/applications', payload);
      setApplications((prev) => [data.application, ...prev]);
      setSuccess('Application created successfully.');
    }
    setModalApp(null);
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/applications/${deleteTarget.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setSuccess('Application deleted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (app, newStatus) => {
    const previous = applications;
    setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)));
    try {
      const data = await api.patch(`/applications/${app.id}/status`, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === app.id ? data.application : a)));
    } catch (err) {
      setApplications(previous);
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <div className="flex gap-2">
          <div className="flex rounded-md border border-slate-300 text-sm">
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-l-md px-3 py-1.5 ${view === 'table' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`rounded-r-md px-3 py-1.5 ${view === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Kanban
            </button>
          </div>
          <button type="button" onClick={() => setModalApp({})} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add Application
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search company, title, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm">
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm">
          <option value="">All employment types</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select value={tagId} onChange={(e) => setTagId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm">
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm">
          <option value="createdAt">Sort by date added</option>
          <option value="deadline">Sort by deadline</option>
          <option value="dateApplied">Sort by date applied</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="mt-6 text-slate-500">No applications yet. Add one to get started.</p>
      ) : view === 'kanban' ? (
        <KanbanBoard applications={applications} onStatusChange={handleStatusChange} />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Date Applied</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{app.company}</td>
                  <td className="px-4 py-3">
                    <Link to={`/applications/${app.id}`} className="text-blue-600 hover:underline">
                      {app.jobTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(app.deadline)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(app.dateApplied)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setModalApp(app)} className="text-slate-600 hover:text-blue-600">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(app)} className="text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalApp !== null && (
        <Modal title={modalApp.id ? 'Edit Application' : 'Add Application'} onClose={() => setModalApp(null)}>
          <ApplicationForm application={modalApp.id ? modalApp : null} tags={tags} onCreateTag={createTag} onSubmit={handleSave} onCancel={() => setModalApp(null)} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete application?"
          message={`This will permanently delete "${deleteTarget.jobTitle}" at ${deleteTarget.company}, including its history and interviews.`}
          confirmLabel={busy ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default Applications;
