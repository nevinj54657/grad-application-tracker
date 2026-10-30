import { Link } from 'react-router-dom';
import { KANBAN_STATUSES, APPLICATION_STATUSES, formatDate } from '../constants';

function KanbanBoard({ applications, onStatusChange }) {
  return (
    <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
      {KANBAN_STATUSES.map((column) => {
        const columnApps = applications.filter((app) => app.status === column.value);
        return (
          <div key={column.value} className="w-64 shrink-0 rounded-lg bg-slate-100 p-3">
            <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
              {column.label}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">{columnApps.length}</span>
            </h3>
            <div className="space-y-2">
              {columnApps.map((app) => (
                <div key={app.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <Link to={`/applications/${app.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                    {app.jobTitle}
                  </Link>
                  <p className="text-xs text-slate-500">{app.company}</p>
                  {app.deadline && <p className="mt-1 text-xs text-slate-400">Deadline: {formatDate(app.deadline)}</p>}
                  <select
                    value={app.status}
                    onChange={(e) => onStatusChange(app, e.target.value)}
                    className="mt-2 w-full rounded border border-slate-200 px-1 py-1 text-xs"
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {columnApps.length === 0 && <p className="text-xs text-slate-400">No applications</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanBoard;
