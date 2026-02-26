import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getModerationQueue, getHiddenRequests, moderateRequest } from '../services/moderation';

const REASON_BADGE = {
  spam:          'bg-orange-100 text-orange-700',
  harassment:    'bg-red-100 text-red-700',
  inappropriate: 'bg-pink-100 text-pink-700',
  'off-topic':   'bg-gray-100 text-gray-600',
  other:         'bg-gray-100 text-gray-600',
};

const URGENCY_BADGE = {
  normal: 'bg-gray-100 text-gray-600',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
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

function ReasonTags({ reports }) {
  const counts = reports.reduce((acc, r) => { acc[r.reason] = (acc[r.reason] || 0) + 1; return acc; }, {});
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(counts).map(([reason, count]) => (
        <span key={reason} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${REASON_BADGE[reason] || ''}`}>
          {reason} {count > 1 && `×${count}`}
        </span>
      ))}
    </div>
  );
}

function ActionModal({ request, onClose, onAction }) {
  const [action, setAction]   = useState('dismiss_reports');
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onAction(request.id, { action, reason });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Moderate Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 truncate font-medium">"{request.title}"</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="form-label text-xs">Action</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { value: 'dismiss_reports', label: 'Dismiss reports', desc: 'Clear flags, keep visible' },
                { value: 'approve',         label: 'Approve',         desc: 'Un-hide + set Open' },
                { value: 'hide',            label: 'Hide content',    desc: 'Remove from public feed' },
                { value: 'restore',         label: 'Restore',         desc: 'Un-hide content' },
              ].map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex flex-col gap-0.5 rounded-lg border p-3 cursor-pointer transition-colors ${
                    action === value ? 'border-brand-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="action"
                    value={value}
                    checked={action === value}
                    onChange={() => setAction(value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                  <span className="text-xs text-gray-400">{desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Reason <span className="text-red-500">*</span></label>
            <textarea
              required
              className="input-field text-sm resize-none"
              rows={2}
              placeholder="Briefly describe the reason for this action…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary text-sm py-1.5">Cancel</button>
            <button type="submit" disabled={loading || !reason.trim()} className="btn-primary text-sm py-1.5">
              {loading ? 'Saving…' : 'Apply action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ModerationQueue() {
  const [tab,        setTab]        = useState('flagged'); // flagged | hidden
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [modal,      setModal]      = useState(null); // request being actioned

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = tab === 'flagged'
        ? await getModerationQueue()
        : await getHiddenRequests();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const handleAction = async (requestId, payload) => {
    await moderateRequest(requestId, payload);
    await load();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Review flagged and hidden content</p>
        </div>
        <Link to="/audit-logs" className="btn-secondary text-sm">Audit log</Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[['flagged', 'Flagged'], ['hidden', 'Hidden']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            {!loading && <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{items.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {tab === 'flagged' ? 'No flagged content. Queue is clear.' : 'No hidden content.'}
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((req) => (
            <li key={req.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/requests/${req.id}`}
                    className="block text-base font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                  >
                    {req.title}
                  </Link>
                  {req.description && (
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">{req.description}</p>
                  )}
                  {tab === 'flagged' && req.reports?.length > 0 && (
                    <ReasonTags reports={req.reports} />
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {req.urgency && req.urgency !== 'normal' && (
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${URGENCY_BADGE[req.urgency] || ''}`}>
                      {req.urgency}
                    </span>
                  )}
                  {tab === 'flagged' && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                      {req.reports?.length} report{req.reports?.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {req.hidden && (
                    <span className="inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {req.author?.displayName ? `By ${req.author.displayName}` : 'Anonymous'} · {timeAgo(req.createdAt)}
                </span>
                <button
                  onClick={() => setModal(req)}
                  className="rounded px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 hover:border-brand-400 hover:text-brand-700 transition-colors"
                >
                  Take action
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <ActionModal
          request={modal}
          onClose={() => setModal(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
