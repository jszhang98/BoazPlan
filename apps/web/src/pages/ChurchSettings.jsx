import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChurchSettings, updateChurchSettings } from '../services/admin';

const PRIVACY_OPTIONS = [
  { value: 'open',   label: 'Open',   desc: 'Members can post directly. New requests are immediately visible.' },
  { value: 'strict', label: 'Strict', desc: 'All requests require leader/pastor approval before appearing.' },
];

export default function ChurchSettings() {
  const { id: churchId } = useParams();
  const [settings, setSettings] = useState(null);
  const [actorId, setActorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable state
  const [privacyMode, setPrivacyMode] = useState('open');
  const [requireApproval, setRequireApproval] = useState(false);
  const [reportThreshold, setReportThreshold] = useState(3);

  useEffect(() => {
    getChurchSettings(churchId)
      .then((data) => {
        setSettings(data);
        setPrivacyMode(data.privacyMode);
        setRequireApproval(data.requireApproval);
        setReportThreshold(data.reportThreshold);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [churchId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateChurchSettings(churchId, {
        privacyMode,
        requireApproval,
        reportThreshold: Number(reportThreshold),
        actorId: actorId || undefined,
        reason: 'Settings updated via admin UI',
      });
      setSettings(updated);
      setSuccess('Settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Church Governance Settings</h1>
        {settings && <p className="mt-1 text-sm text-gray-500">{settings.name}</p>}
      </div>

      {error   && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSave} className="card space-y-6">

        {/* Privacy mode */}
        <div>
          <label className="form-label">Privacy Mode</label>
          <div className="mt-2 space-y-2">
            {PRIVACY_OPTIONS.map((opt) => (
              <label key={opt.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${privacyMode === opt.value ? 'border-brand-600 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="privacyMode"
                  value={opt.value}
                  checked={privacyMode === opt.value}
                  onChange={() => setPrivacyMode(opt.value)}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium text-gray-900">{opt.label}</p>
                  <p className="text-sm text-gray-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Require approval toggle */}
        <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
          <div className="flex-1">
            <p className="font-medium text-gray-900">Require Approval for All Posts</p>
            <p className="text-sm text-gray-500">
              Even in Open mode, all new requests will be queued for leader review before becoming public.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRequireApproval((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${requireApproval ? 'bg-brand-600' : 'bg-gray-200'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ${requireApproval ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* Report threshold */}
        <div>
          <label className="form-label">
            Auto-Hide Threshold
            <span className="ml-1 text-xs font-normal text-gray-400">(reports needed to auto-hide)</span>
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="100"
              value={reportThreshold}
              onChange={(e) => setReportThreshold(e.target.value)}
              className="input-field w-24"
            />
            <p className="text-sm text-gray-500">
              A request is automatically hidden once it receives this many pending reports.
            </p>
          </div>
        </div>

        {/* Optional actor ID for audit trail */}
        <div>
          <label className="form-label">
            Your User ID
            <span className="ml-1 text-xs font-normal text-gray-400">(optional — recorded in audit log)</span>
          </label>
          <input
            type="text"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            placeholder="paste your user ID"
            className="input-field"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          <a href="/audit-logs" className="text-sm text-gray-500 hover:underline">View audit log →</a>
        </div>
      </form>
    </div>
  );
}
