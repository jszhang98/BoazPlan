import React, { useState, useEffect } from 'react';
import { listAssignments, assignVolunteer, updateAssignment, deleteAssignment } from '../../services/assignments';

const STATUS_BADGE = {
  pending:   'bg-yellow-100 text-yellow-700',
  accepted:  'bg-blue-100 text-blue-700',
  declined:  'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
};

const ACTIONS = {
  pending:  [{ label: 'Accept',   next: 'accepted'  }, { label: 'Decline', next: 'declined'  }],
  accepted: [{ label: 'Complete', next: 'completed' }, { label: 'Decline', next: 'declined'  }],
  declined: [],
  completed:[],
};

export default function AssignmentPanel({ requestId, requestStatus, onStatusChange }) {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [volunteerIdInput, setVolunteerIdInput] = useState('');
  const [noteInput,        setNoteInput]        = useState('');
  const [assigning,        setAssigning]        = useState(false);
  const [assignError,      setAssignError]      = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setAssignments(await listAssignments(requestId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [requestId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError(null);
    setAssigning(true);
    try {
      const a = await assignVolunteer(requestId, { volunteerId: volunteerIdInput.trim(), note: noteInput.trim() || undefined });
      setAssignments((prev) => [...prev, a]);
      setVolunteerIdInput('');
      setNoteInput('');
      onStatusChange && onStatusChange('assigned');
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleAction = async (assignmentId, nextStatus) => {
    try {
      const updated = await updateAssignment(requestId, assignmentId, { status: nextStatus });
      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? updated : a)));
      if (nextStatus === 'completed')  onStatusChange && onStatusChange('resolved');
      if (nextStatus === 'declined') {
        const stillActive = assignments.filter((a) => a.id !== assignmentId && ['pending', 'accepted'].includes(a.status));
        if (stillActive.length === 0) onStatusChange && onStatusChange('open');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (assignmentId) => {
    try {
      await deleteAssignment(requestId, assignmentId);
      const remaining = assignments.filter((a) => a.id !== assignmentId && ['pending', 'accepted'].includes(a.status));
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      if (remaining.length === 0) onStatusChange && onStatusChange('open');
    } catch (err) {
      setError(err.message);
    }
  };

  const canAssign = !['resolved'].includes(requestStatus);

  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-semibold text-gray-700">Volunteer Assignments</h2>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Assignment list */}
      {loading ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No volunteers assigned yet.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">
                    {a.volunteer?.displayName || a.volunteerId}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[a.status] || ''}`}>
                    {a.status}
                  </span>
                </div>
                {a.note && <p className="mt-1 text-xs text-gray-500">{a.note}</p>}
                {/* Volunteer action buttons */}
                {ACTIONS[a.status]?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {ACTIONS[a.status].map(({ label, next }) => (
                      <button
                        key={next}
                        onClick={() => handleAction(a.id, next)}
                        className={`rounded px-2.5 py-1 text-xs font-medium border transition-colors ${
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
              </div>
              {!['completed', 'declined'].includes(a.status) && (
                <button
                  onClick={() => handleRemove(a.id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                  title="Remove assignment"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Assign new volunteer */}
      {canAssign && (
        <form onSubmit={handleAssign} className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Assign a volunteer</p>
          <div>
            <label className="form-label text-xs">Volunteer User ID</label>
            <input
              className="input-field text-sm"
              placeholder="Paste a user ID…"
              value={volunteerIdInput}
              onChange={(e) => setVolunteerIdInput(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label text-xs">Note <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              className="input-field text-sm"
              placeholder="e.g. Available Saturday afternoon"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
          </div>
          {assignError && <p className="text-xs text-red-600">{assignError}</p>}
          <button type="submit" disabled={assigning} className="btn-primary text-sm py-1.5">
            {assigning ? 'Assigning…' : 'Assign volunteer'}
          </button>
        </form>
      )}
    </div>
  );
}
