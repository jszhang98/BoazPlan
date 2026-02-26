import React, { useState, useEffect, useCallback } from 'react';
import { createRequest } from '../../services/requests';

const DRAFT_KEY = 'boazplan:request-draft';

const URGENCY_OPTIONS = [
  { value: 'normal', label: 'Normal', cls: 'bg-gray-100 text-gray-700' },
  { value: 'high',   label: 'High',   cls: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', cls: 'bg-red-100 text-red-700' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public',  label: 'Public',       hint: 'Everyone in the church can see this.' },
  { value: 'group',   label: 'Group only',    hint: 'Only members of your small group.' },
  { value: 'private', label: 'Pastors only',  hint: 'Only pastors and admins can see this.' },
];

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}; } catch { return {}; }
}
function saveDraft(data) { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); }
function clearDraft()    { localStorage.removeItem(DRAFT_KEY); }

export default function NewRequest({ onCreated }) {
  const draft = loadDraft();

  const [title,       setTitle]       = useState(draft.title       || '');
  const [description, setDescription] = useState(draft.description || '');
  const [urgency,     setUrgency]     = useState(draft.urgency     || 'normal');
  const [visibility,  setVisibility]  = useState(draft.visibility  || 'public');
  const [anonymous,   setAnonymous]   = useState(draft.anonymous   || false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [isOnline,    setIsOnline]    = useState(navigator.onLine);
  const [queued,      setQueued]      = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  // Track online / offline status
  useEffect(() => {
    const up   = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // Auto-save draft whenever fields change
  useEffect(() => {
    if (title || description) saveDraft({ title, description, urgency, visibility, anonymous });
  }, [title, description, urgency, visibility, anonymous]);

  // When back online after queuing, notify user so they can re-submit
  useEffect(() => {
    if (isOnline && queued) setQueued(false); // remain ready — user clicks again
  }, [isOnline, queued]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isOnline) {
      saveDraft({ title, description, urgency, visibility });
      setQueued(true);
      return;
    }

    setLoading(true);
    try {
      const r = await createRequest({ title, description, urgency, visibility, anonymous });
      clearDraft();
      setSubmitted(true);
      onCreated && onCreated(r);
      setTitle('');
      setDescription('');
      setUrgency('normal');
      setVisibility('public');
      setAnonymous(false);
      setQueued(false);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to post request.');
    } finally {
      setLoading(false);
    }
  };

  const hasDraft = !!(draft.title || draft.description);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Post a Request</h3>
        {!isOnline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Offline — draft saved
          </span>
        )}
      </div>

      {submitted && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          Request posted successfully!
        </div>
      )}

      {queued && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          Draft saved — we'll retry when you're back online.
        </div>
      )}

      {hasDraft && isOnline && !queued && !submitted && title && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 flex items-center justify-between">
          <span>You have a saved draft.</span>
          <button onClick={() => { clearDraft(); setTitle(''); setDescription(''); }} className="text-blue-500 hover:text-blue-700 underline text-xs">Discard</button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="req-title" className="form-label">Title <span className="text-red-500">*</span></label>
          <input
            id="req-title"
            className="input-field"
            placeholder="e.g. Need help with meals this week"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="req-desc" className="form-label">Description</label>
          <textarea
            id="req-desc"
            className="input-field resize-none"
            rows={3}
            placeholder="Any additional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="form-label">Urgency</label>
          <div className="flex gap-2 mt-1">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setUrgency(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                  urgency === opt.value
                    ? `${opt.cls} border-transparent ring-2 ring-offset-1 ring-brand-500`
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="form-label">Visibility</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {VISIBILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`relative flex cursor-pointer flex-col rounded-lg border p-3 transition-colors ${
                  visibility === opt.value
                    ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input type="radio" name="visibility" value={opt.value} checked={visibility === opt.value} onChange={() => setVisibility(opt.value)} className="sr-only" />
                <span className={`text-xs font-semibold ${visibility === opt.value ? 'text-brand-700' : 'text-gray-900'}`}>{opt.label}</span>
                <span className="mt-0.5 text-xs text-gray-400 leading-tight">{opt.hint}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <button
            type="button"
            role="switch"
            aria-checked={anonymous}
            onClick={() => setAnonymous((v) => !v)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${anonymous ? 'bg-brand-600' : 'bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${anonymous ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">Post anonymously</p>
            <p className="text-xs text-gray-500 mt-0.5">Your name won't be shown to other members. Pastors and admins can still see who posted.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Posting...' : !isOnline ? 'Save draft (offline)' : 'Post request'}
        </button>
      </form>
    </div>
  );
}
