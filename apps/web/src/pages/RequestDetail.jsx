import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequest, updateRequest } from '../services/requests';
import AssignmentPanel from '../features/assignments/AssignmentPanel';
import { submitReport } from '../services/moderation';

const REPORT_REASONS = ['spam', 'harassment', 'inappropriate', 'off-topic', 'other'];

const URGENCY_BADGE = {
  normal: 'bg-gray-100 text-gray-600',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700 font-bold',
};

const STATUS_BADGE = {
  open:             'bg-blue-100 text-blue-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  assigned:         'bg-purple-100 text-purple-700',
  resolved:         'bg-green-100 text-green-700',
};

const VALID_STATUS = ['open', 'pending_approval', 'assigned', 'resolved'];
const STATUS_LABELS = {
  open: 'Open',
  pending_approval: 'Pending approval',
  assigned: 'Assigned',
  resolved: 'Resolved',
};

const VISIBILITY_LABELS = {
  public:  'Public — everyone in the church',
  group:   'Group only — small group members',
  private: 'Pastors only',
};

function timeAgo(dateStr) {
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60)    return 'just now';
  if (secs < 3600)  return `${Math.floor(secs / 60)} minutes ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} hours ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function RequestDetail() {
  const { id }      = useParams();
  const [req,       setReq]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [updating,  setUpdating]  = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showReport,  setShowReport]  = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportNote,   setReportNote]   = useState('');
  const [reportMsg,    setReportMsg]    = useState(null);
  const [reporting,    setReporting]    = useState(false);

  useEffect(() => {
    getRequest(id)
      .then(setReq)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (newStatus) => {
    if (!req || newStatus === req.status) return;
    setUpdating(true);
    setStatusMsg(null);
    try {
      const updated = await updateRequest(id, { status: newStatus });
      setReq(updated);
      setStatusMsg(`Status updated to "${STATUS_LABELS[newStatus]}".`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin h-7 w-7 text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3 3-3h-4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="text-4xl">404</div>
        <p className="text-gray-500">{error}</p>
        <Link to="/" className="btn-secondary inline-block">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link to="/requests" className="hover:text-brand-600">Feed</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium truncate">{req.title}</span>
      </nav>

      {/* Main card */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{req.title}</h1>
          <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${URGENCY_BADGE[req.urgency] || URGENCY_BADGE.normal}`}>
            {req.urgency}
          </span>
        </div>

        {req.description && (
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{req.description}</p>
        )}

        {/* Meta grid */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-gray-100 pt-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Status</dt>
            <dd>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[req.status] || STATUS_BADGE.open}`}>
                {STATUS_LABELS[req.status] || req.status}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Visibility</dt>
            <dd className="text-gray-700">{VISIBILITY_LABELS[req.visibility] || req.visibility}</dd>
          </div>

          {req.anonymous ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Posted by</dt>
              <dd className="text-gray-500 italic text-sm">Anonymous</dd>
            </div>
          ) : req.author?.displayName ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Posted by</dt>
              <dd className="text-gray-700">{req.author.displayName}</dd>
            </div>
          ) : null}

          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Posted</dt>
            <dd className="text-gray-700">{timeAgo(req.createdAt)}</dd>
          </div>

          {req.updatedAt !== req.createdAt && (
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">Last updated</dt>
              <dd className="text-gray-700">{timeAgo(req.updatedAt)}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Pastor approval actions */}
      {req.status === 'pending_approval' && (
        <div className="card border-yellow-200 bg-yellow-50 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-yellow-800">Awaiting pastor approval</h2>
          </div>
          <p className="text-xs text-yellow-700">This request was submitted to a church with strict privacy settings. A pastor or admin must approve it before it appears in the feed.</p>
          <div className="flex gap-3">
            <button
              disabled={updating}
              onClick={() => changeStatus('open')}
              className="btn-primary text-sm py-1.5 px-4"
            >
              Approve
            </button>
            <button
              disabled={updating}
              onClick={() => changeStatus('resolved')}
              className="btn-secondary text-sm py-1.5 px-4 border-red-200 text-red-600 hover:bg-red-50"
            >
              Decline
            </button>
          </div>
          {statusMsg && (
            <p className={`text-xs ${statusMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{statusMsg}</p>
          )}
        </div>
      )}

      {/* Status management */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {VALID_STATUS.map((s) => (
            <button
              key={s}
              disabled={updating || req.status === s}
              onClick={() => changeStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                req.status === s
                  ? `${STATUS_BADGE[s]} border-transparent cursor-default`
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-700 disabled:opacity-40'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {statusMsg && (
          <p className={`mt-3 text-xs ${statusMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {statusMsg}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className="btn-secondary text-sm">
          Back to feed
        </Link>
        <button
          onClick={() => { setShowReport((v) => !v); setReportMsg(null); }}
          className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
        >
          {showReport ? 'Cancel report' : 'Report this request'}
        </button>
      </div>

      {/* Report form */}
      {showReport && (
        <div className="card border-orange-200 bg-orange-50 space-y-3">
          <h2 className="text-sm font-semibold text-orange-800">Report content</h2>
          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReportReason(r)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all capitalize ${
                  reportReason === r
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            className="input-field text-sm resize-none"
            rows={2}
            placeholder="Additional context (optional)…"
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
          />
          {reportMsg && (
            <p className={`text-xs ${reportMsg.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>{reportMsg}</p>
          )}
          <button
            disabled={reporting}
            onClick={async () => {
              setReporting(true);
              setReportMsg(null);
              try {
                await submitReport(id, { reason: reportReason, notes: reportNote || undefined });
                setReportMsg('Report submitted. Thank you — a moderator will review this.');
                setShowReport(false);
              } catch (err) {
                setReportMsg(`Error: ${err.message}`);
              } finally {
                setReporting(false);
              }
            }}
            className="btn-primary text-sm py-1.5 bg-orange-500 hover:bg-orange-600 border-orange-500"
          >
            {reporting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      )}

      {/* Volunteer assignment panel */}
      <AssignmentPanel
        requestId={id}
        requestStatus={req.status}
        onStatusChange={(s) => setReq((r) => ({ ...r, status: s }))}
      />
    </div>
  );
}
