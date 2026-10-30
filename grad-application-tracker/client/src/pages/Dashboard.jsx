import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import { formatDate, daysUntil, labelFor, INTERVIEW_TYPES } from '../constants';

const CARDS = [
  { key: 'SAVED', label: 'Saved' },
  { key: 'APPLIED', label: 'Applied' },
  { key: 'ONLINE_ASSESSMENT', label: 'Online Assessment' },
  { key: 'INTERVIEW', label: 'Interviews' },
  { key: 'OFFER', label: 'Offers' },
  { key: 'REJECTED', label: 'Rejected' },
];

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {CARDS.map((card) => (
          <div key={card.key} className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{data.counts[card.key] ?? 0}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Upcoming Deadlines</h2>
          {data.upcomingDeadlines.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No upcoming deadlines.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {data.upcomingDeadlines.map((item) => (
                <li key={`${item.source}-${item.id}`} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <Link
                      to={item.source === 'application' ? `/applications/${item.id}` : '/saved-jobs'}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {item.company}
                    </Link>
                    <p className="text-slate-500">{item.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">{formatDate(item.deadline)}</p>
                    <p className="text-xs text-slate-400">{daysUntil(item.deadline)} days</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Upcoming Interviews</h2>
          {data.upcomingInterviews.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No upcoming interviews.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {data.upcomingInterviews.map((iv) => (
                <li key={iv.id} className="py-2 text-sm">
                  <Link to={`/applications/${iv.application.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                    {iv.application.company} — {iv.application.jobTitle}
                  </Link>
                  <p className="text-slate-500">
                    {labelFor(INTERVIEW_TYPES, iv.type)} interview · {formatDateTime(iv.scheduledAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
