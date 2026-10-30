import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import useTags from '../hooks/useTags';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';

function Settings() {
  const { user } = useAuth();
  const { tags, loading, createTag, deleteTag } = useTags();

  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newTagName.trim()) return;

    setSubmitting(true);
    try {
      await createTag(newTagName.trim());
      setNewTagName('');
      setSuccess('Tag created successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTag(deleteTarget.id);
      setSuccess('Tag deleted successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Account</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="text-slate-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-900">{user?.email}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Tags</h2>
        <p className="mt-1 text-sm text-slate-500">Tags help you categorise applications, e.g. "Software Engineering" or "AWS".</p>

        <div className="mt-3 space-y-2">
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>
        </div>

        <form onSubmit={handleCreateTag} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Adding...' : 'Add Tag'}
          </button>
        </form>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No tags yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.id} className="flex items-center gap-1.5 rounded-full bg-slate-100 py-0.5 pl-3 pr-1.5 text-sm text-slate-700">
                {tag.name}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(tag)}
                  className="rounded-full px-1.5 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                  aria-label={`Delete tag ${tag.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete tag?"
          message={`This will remove "${deleteTarget.name}" from any applications it's assigned to.`}
          confirmLabel={deleting ? 'Deleting...' : 'Delete'}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default Settings;
