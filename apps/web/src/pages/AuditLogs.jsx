import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAuditLogs } from '../services/moderation';

const ACTION_BADGE = {
  report_created:        'bg-yellow-100 text-yellow-700',
  content_auto_hidden:   'bg-orange-100 text-orange-700',
  moderation_hide:       'bg-red-100 text-red-700',
  moderation_restore:    'bg-green-100 text-green-700',
  moderation_approve:    'bg-blue-100 text-blue-700',
  moderation_dismiss_reports: 'bg-gray-100 text-gray-600',
};

const TARGET_TYPE_OPTIONS = ['', 'request', 'user', 'church', 'membership'];
const ACTION_OPTIONS = [
  '',
  'report_created',
  'content_auto_hidden',
  'moderation_hide',
  'moderation_restore',
  'moderation_approve',
  'moderation_dismiss_reports',
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AuditLogs() {
  const [logs,       setLogs]       = useState([]);
  const [meta,       setMeta]       = useState({ total: 0, limit: 50, offset: 0 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [targetType, setTargetType] = useState('');
  const [action,     setAction]     = useState('');
  const [targetId,   setTargetId]   = useState('');

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuditLogs({
        targetType: targetType || undefined,
        action:     action     || undefined,
        targetId:   targetId   || undefined,
        limit:  50,
        offset,
      });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetType, action, targetId]);

  useEffect(() => { load(0); }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Immutable record of all moderation and governance actions</p>
        </div>
        <Link to="/moderation" className="btn-secondary text-sm">Moderation queue</Link>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-36">
          <label className="form-label text-xs">Action type</label>
          <select className="input-field text-sm" value={action} onChange={(e) => setAction(e.target.value)}>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a || 'All actions'}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-36">
          <label className="form-label text-xs">Target type</label>
          <select className="input-field text-sm" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
            {TARGET_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t || 'All targets'}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="form-label text-xs">Target ID</label>
          <input
            className="input-field text-sm"
            placeholder="Paste an ID to filter…"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
        </div>
        <button onClick={() => { setAction(''); setTargetType(''); setTargetId(''); }} className="btn-secondary text-sm py-2">
          Clear
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Summary */}
      {!loading && (
        <p className="text-xs text-gray-400">
          Showing {logs.length} of {meta.total} entries
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="card animate-pulse flex gap-4 items-center">
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded flex-1" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No audit log entries match the current filters.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Time', 'Action', 'Actor', 'Target', 'Reason'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_BADGE[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {log.actor?.displayName || <span className="italic text-gray-400">System</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="text-gray-500 capitalize">{log.targetType}</span>
                      <span className="ml-1 font-mono text-gray-400 text-[10px]">{log.targetId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{log.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.total > meta.limit && (
            <div className="flex justify-between items-center text-sm">
              <button
                disabled={meta.offset === 0}
                onClick={() => load(Math.max(0, meta.offset - meta.limit))}
                className="btn-secondary py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {Math.floor(meta.offset / meta.limit) + 1} of {Math.ceil(meta.total / meta.limit)}
              </span>
              <button
                disabled={meta.offset + meta.limit >= meta.total}
                onClick={() => load(meta.offset + meta.limit)}
                className="btn-secondary py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
