import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import { labelFor, INTERVIEW_TYPES, INTERVIEW_OUTCOMES } from '../constants';

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function InterviewRow({ iv }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link to={`/applications/${iv.application.id}`} className="font-medium text-slate-900 hover:text-blue-600">
            {iv.application.company} — {iv.application.jobTitle}
          </Link>
          <p className="text-sm text-slate-500">
            {labelFor(INTERVIEW_TYPES, iv.type)} interview · {formatDateTime(iv.scheduledAt)}
          </p>
          {iv.location && <p className="text-sm text-slate-500">{iv.location}</p>}
          {iv.meetingUrl && (
            <a href={iv.meetingUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
              Join meeting ↗
            </a>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {labelFor(INTERVIEW_OUTCOMES, iv.outcome)}
        </span>
      </div>
    </div>
  );
}

function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/interviews')
      .then((data) => setInterviews(data.interviews))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = interviews.filter((iv) => new Date(iv.scheduledAt) >= now);
  const past = interviews.filter((iv) => new Date(iv.scheduledAt) < now).reverse();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>
      <p className="mt-1 text-sm text-slate-500">
        Interviews are added from an application's details page. This page shows all of them in one place.
      </p>

      <div className="mt-4">
        <Alert type="error">{error}</Alert>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">Loading interviews...</p>
      ) : interviews.length === 0 ? (
        <p className="mt-6 text-slate-500">No interviews scheduled yet.</p>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming interviews.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((iv) => (
                  <InterviewRow key={iv.id} iv={iv} />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Past</h2>
              <div className="space-y-3">
                {past.map((iv) => (
                  <InterviewRow key={iv.id} iv={iv} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default Interviews;
