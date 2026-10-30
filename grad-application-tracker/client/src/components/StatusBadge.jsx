import { labelFor, APPLICATION_STATUSES } from '../constants';

const COLORS = {
  SAVED: 'bg-slate-100 text-slate-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  ONLINE_ASSESSMENT: 'bg-purple-100 text-purple-700',
  INTERVIEW: 'bg-amber-100 text-amber-700',
  OFFER: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-200 text-slate-500',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status] || 'bg-slate-100 text-slate-700'}`}>
      {labelFor(APPLICATION_STATUSES, status)}
    </span>
  );
}

export default StatusBadge;
