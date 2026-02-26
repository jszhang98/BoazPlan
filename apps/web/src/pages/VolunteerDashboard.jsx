import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMyAssignments, updateAssignment } from '../services/assignments';

const STATUS_TABS = ['all', 'pending', 'accepted', 'completed', 'declined'];

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-700',
  accepted:  'bg-blue-100 text-blue-700',
  declined:  'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
};

const URGENCY_BADGE = {
  normal: 'bg-gray-100 text-gray-600',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const ACTIONS = {
  pending:  [{ label: 'Accept',   next: 'accepted'  }, { label: 'Decline', next: 'declined'  }],
  accepted: [{ label: 'Mark Complete', next: 'completed' }, { label: 'Decline', next: 'declined' }],
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function VolunteerDashboard() {
  const { userId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [tab,         setTab]         = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setAssignments(await getMyAssignments(userId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
  }, [userId]);

  const handleAction = async (requestId, assignmentId, nextStatus) => {
    try {
      const updated = await updateAssignment(requestId, assignmentId, { status: nextStatus });
      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, ...updated } : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const visible = tab === 'all'
    ? assignments
    : assignments.filter((a) => a.status === tab);

  const counts = STATUS_TABS.slice(1).reduce((acc, s) => {
    acc[s] = assignments.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Volunteer Work</h1>
          <p className="text-sm text-gray-500 mt-1">
            User&nbsp;<span className="font-mono text-xs">{userId}</span>
          </p>
        </div>
        <Link to="/requests" className="btn-secondary text-sm">Browse requests</Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Summary strip */}
      {!loading && assignments.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[['pending','Pending'],['accepted','Active'],['completed','Done'],['declined','Declined']].map(([s, label]) => (
            <button
              key={s}
              onClick={() => setTab(tab === s ? 'all' : s)}
              className={`rounded-lg border p-3 text-center transition-colors ${tab === s ? 'border-brand-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className={`text-xl font-bold ${tab === s ? 'text-brand-600' : 'text-gray-800'}`}>{counts[s] || 0}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 pb-0">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === s
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'all' ? `All (${assignments.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {tab === 'all'
            ? "You haven't been assigned to any requests yet."
            : `No ${tab} assignments.`}
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((a) => {
            const req = a.request;
            return (
              <li key={a.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/requests/${req.id}`}
                      className="block text-base font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                    >
                      {req.title}
                    </Link>
                    {req.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{req.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[a.status] || ''}`}>
                      {a.status}
                    </span>
                    {req.urgency && req.urgency !== 'normal' && (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${URGENCY_BADGE[req.urgency] || ''}`}>
                        {req.urgency}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Assigned {timeAgo(a.createdAt)}</span>
                  {req.author && !req.anonymous && (
                    <span>By {req.author.displayName}</span>
                  )}
                  {req.anonymous && <span>Anonymous request</span>}
                </div>

                {a.note && (
                  <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">"{a.note}"</p>
                )}

                {/* Action buttons */}
                {ACTIONS[a.status] && (
                  <div className="flex gap-2 pt-1">
                    {ACTIONS[a.status].map(({ label, next }) => (
                      <button
                        key={next}
                        onClick={() => handleAction(req.id, a.id, next)}
                        className={`rounded px-3 py-1.5 text-xs font-medium border transition-colors ${
                          next === 'declined'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : next === 'completed'
                            ? 'border-green-200 text-green-700 hover:bg-green-50'
                            : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
