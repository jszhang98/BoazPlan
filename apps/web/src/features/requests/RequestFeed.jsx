import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listRequests } from '../../services/requests';

const STATUS_TABS = [
  { value: '',           label: 'All'       },
  { value: 'open',       label: 'Open'      },
  { value: 'assigned',   label: 'Assigned'  },
  { value: 'resolved',   label: 'Resolved'  },
];

const URGENCY_BADGE = {
  normal: 'bg-gray-100 text-gray-600',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_BADGE = {
  open:              'bg-blue-100 text-blue-700',
  pending_approval:  'bg-yellow-100 text-yellow-700',
  assigned:          'bg-purple-100 text-purple-700',
  resolved:          'bg-green-100 text-green-700',
};

const VISIBILITY_ICON = {
  public:  { label: 'Public',       icon: '🌐' },
  group:   { label: 'Group only',   icon: '👥' },
  private: { label: 'Pastors only', icon: '🔒' },
};

function timeAgo(dateStr) {
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60)   return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function UrgencyBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${URGENCY_BADGE[value] || URGENCY_BADGE.normal}`}>
      {value === 'urgent' && <span className="mr-1" aria-hidden="true">!</span>}
      {value}
    </span>
  );
}

function StatusBadge({ value }) {
  const label = value?.replace('_', ' ') ?? 'open';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[value] || STATUS_BADGE.open}`}>
      {label}
    </span>
  );
}

export default function RequestFeed({ churchId, authorId, showNewRequestLink = false }) {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [status,    setStatus]    = useState('');
  const [urgency,   setUrgency]   = useState('');
  const [visibility,setVisibility]= useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status)     params.status     = status;
      if (urgency)    params.urgency    = urgency;
      if (visibility) params.visibility = visibility;
      if (churchId)   params.churchId   = churchId;
      // authorId filtering done client-side until auth is wired
      let data = await listRequests(params);
      if (authorId) data = data.filter((r) => r.authorId === authorId);
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, urgency, visibility, churchId, authorId]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => { setStatus(''); setUrgency(''); setVisibility(''); };
  const hasFilter = status || urgency || visibility;

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              status === tab.value
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 pb-1">
          {/* Urgency filter */}
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All urgencies</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Visibility filter */}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All visibility</option>
            <option value="public">Public</option>
            <option value="group">Group only</option>
            <option value="private">Pastors only</option>
          </select>

          {hasFilter && (
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Feed list */}
      {loading && (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3 3-3h-4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
          </svg>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🕊️</div>
          <p className="text-sm text-gray-400 italic">
            {hasFilter ? 'No requests match these filters.' : 'No requests yet. Be the first to share a need.'}
          </p>
          {hasFilter && (
            <button onClick={clearFilters} className="mt-2 text-xs text-brand-600 underline hover:text-brand-700">Clear filters</button>
          )}
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                to={`/requests/${r.id}`}
                className="card block hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
                        {r.title}
                      </p>
                      {r.urgency !== 'normal' && <UrgencyBadge value={r.urgency} />}
                    </div>

                    {r.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{r.description}</p>
                    )}

                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <StatusBadge value={r.status} />

                      {r.status === 'pending_approval' && (
                        <span className="text-xs font-medium text-yellow-600 italic">Awaiting pastor approval</span>
                      )}

                      {r.visibility && r.visibility !== 'public' && (
                        <span className="text-xs text-gray-400">
                          {VISIBILITY_ICON[r.visibility]?.icon} {VISIBILITY_ICON[r.visibility]?.label}
                        </span>
                      )}

                      {r.anonymous ? (
                        <span className="text-xs text-gray-400 italic">Anonymous</span>
                      ) : r.author?.displayName ? (
                        <span className="text-xs text-gray-400">by {r.author.displayName}</span>
                      ) : null}

                      <span className="text-xs text-gray-400 ml-auto">{timeAgo(r.createdAt)}</span>
                    </div>
                  </div>

                  {r.urgency === 'urgent' && (
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-red-500 mt-1.5 animate-pulse" title="Urgent" />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showNewRequestLink && (
        <div className="text-center pt-2">
          <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 underline">
            ← Back to post a request
          </Link>
        </div>
      )}
    </div>
  );
}
