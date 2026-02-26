import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChurch } from '../services/churches';
import { listMembers, addMember, updateMemberRole, removeMember } from '../services/memberships';

const ROLES = ['member', 'leader', 'pastor', 'admin'];

const ROLE_BADGE = {
  admin:   'bg-purple-100 text-purple-700',
  pastor:  'bg-brand-100 text-brand-700',
  leader:  'bg-blue-100 text-blue-700',
  member:  'bg-gray-100 text-gray-600',
};

export default function ChurchMembers() {
  const { id } = useParams();
  const [church, setChurch] = useState(null);
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getChurch(id).then(setChurch).catch(() => {});
    listMembers(id).then(setMembers).catch(() => {});
  }, [id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const m = await addMember(id, { userId, role });
      setMembers((prev) => [...prev, m]);
      setUserId('');
      setRole('member');
      setSuccess('Member added successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, userId, newRole) => {
    try {
      const updated = await updateMemberRole(id, userId, newRole);
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: updated.role } : m));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (memberId, userId) => {
    if (!confirm('Remove this member from the church?')) return;
    try {
      await removeMember(id, userId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm text-brand-600 hover:underline">&larr; Home</Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {church ? church.name : 'Church'} — Members
          </h1>
          {church && (
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{church.slug}</span>
              {' · '}
              <span className="capitalize">{church.privacyMode} mode</span>
              {' · '}
              <Link to={`/churches/${id}/settings`} className="text-brand-600 hover:underline">Settings</Link>
            </p>
          )}
        </div>
      </div>

      {/* Add Member */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Member</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <select
            className="input-field sm:w-36"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
          <button type="submit" disabled={loading} className="btn-primary sm:w-auto">
            {loading ? 'Adding...' : 'Add member'}
          </button>
        </form>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}
      </div>

      {/* Member List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Members <span className="text-gray-400 font-normal text-sm">({members.length})</span>
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No members yet.</p>
        ) : (
          <ul className="space-y-3">
            {members.map((m) => (
              <li key={m.id} className="card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {m.user?.displayName || m.user?.email || m.userId}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{m.user?.email}</p>
                </div>
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, m.userId, e.target.value)}
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer ${ROLE_BADGE[m.role] || ROLE_BADGE.member}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemove(m.id, m.userId)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Remove member"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
