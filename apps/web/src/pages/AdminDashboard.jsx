import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, exportRequestsCSVUrl, exportAssignmentsCSVUrl } from '../services/admin';

// Stat card component
function StatCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green:  'bg-green-50  text-green-700  border-green-200',
    amber:  'bg-amber-50  text-amber-700  border-amber-200',
    red:    'bg-red-50    text-red-700    border-red-200',
    slate:  'bg-slate-50  text-slate-700  border-slate-200',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}
    </div>
  );
}

// Simple horizontal bar to represent a ratio
function RateBar({ rate }) {
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
      <div
        className="h-2 rounded-full bg-green-500 transition-all"
        style={{ width: `${rate}%` }}
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard…</div>;
  if (error)   return <div className="p-8 text-center text-red-500">{error}</div>;

  const { requests, users, churches, memberships, assignments, moderation } = stats;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform-wide overview</p>
        </div>
        <div className="flex gap-2">
          <a
            href={exportRequestsCSVUrl()}
            download
            className="btn-secondary text-sm"
          >
            ↓ Export Requests
          </a>
          <a
            href={exportAssignmentsCSVUrl()}
            download
            className="btn-secondary text-sm"
          >
            ↓ Export Assignments
          </a>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/moderation" className="btn-secondary text-sm">Moderation Queue {moderation.pendingReports > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{moderation.pendingReports}</span>}</Link>
        <Link to="/audit-logs" className="btn-secondary text-sm">Audit Logs</Link>
      </div>

      {/* Community stats */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Community</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Members" value={users.total} color="indigo" />
          <StatCard label="Churches" value={churches.total} color="indigo" />
          <StatCard label="Memberships" value={memberships.total} color="slate" />
        </div>
      </section>

      {/* Requests */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Requests</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Open"            value={requests.byStatus.open}             color="indigo" />
          <StatCard label="Pending Approval" value={requests.byStatus.pending_approval} color="amber" />
          <StatCard label="Assigned"        value={requests.byStatus.assigned}         color="slate" />
          <StatCard label="Resolved"        value={requests.byStatus.resolved}         color="green" />
        </div>
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-700">Resolution Rate</p>
            <p className="text-2xl font-bold text-green-700">{requests.requestResolutionRate}%</p>
          </div>
          <RateBar rate={requests.requestResolutionRate} />
          <p className="mt-1 text-xs text-green-600">{requests.byStatus.resolved} of {requests.total} total requests resolved</p>
        </div>
        {requests.hidden > 0 && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {requests.hidden} request{requests.hidden !== 1 ? 's' : ''} currently hidden by moderation
          </div>
        )}
      </section>

      {/* Urgency breakdown */}
      {Object.keys(requests.byUrgency).length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Requests by Urgency</h2>
          <div className="grid grid-cols-3 gap-4">
            {['normal', 'high', 'urgent'].map((u) => (
              <StatCard
                key={u}
                label={u.charAt(0).toUpperCase() + u.slice(1)}
                value={requests.byUrgency[u] ?? 0}
                color={u === 'urgent' ? 'red' : u === 'high' ? 'amber' : 'slate'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Volunteer assignments */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Volunteers</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total Assignments" value={assignments.total}     color="indigo" />
          <StatCard label="Completed"         value={assignments.completed} color="green" />
          <StatCard
            label="Completion Rate"
            value={`${assignments.volunteerCompletionRate}%`}
            color={assignments.volunteerCompletionRate >= 70 ? 'green' : 'amber'}
          />
        </div>
      </section>

      {/* Moderation */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Moderation</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Pending Reports" value={moderation.pendingReports} color={moderation.pendingReports > 0 ? 'red' : 'green'} />
          <StatCard label="Total Reports"   value={moderation.totalReports}   color="slate" />
        </div>
      </section>
    </div>
  );
}
