export async function assignVolunteer(requestId, { volunteerId, note }) {
  const res = await fetch(`/api/v1/requests/${requestId}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ volunteerId, note }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Assignment failed');
  return json.data;
}

export async function listAssignments(requestId) {
  const res = await fetch(`/api/v1/requests/${requestId}/assignments`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to load assignments');
  return json.data;
}

export async function updateAssignment(requestId, assignmentId, payload) {
  const res = await fetch(`/api/v1/requests/${requestId}/assignments/${assignmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Update failed');
  return json.data;
}

export async function deleteAssignment(requestId, assignmentId) {
  const res = await fetch(`/api/v1/requests/${requestId}/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json?.error?.message || 'Delete failed');
  }
}

export async function getMyAssignments(userId, status) {
  const qs = status ? `?status=${status}` : '';
  const res = await fetch(`/api/v1/users/${userId}/assignments${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to load assignments');
  return json.data;
}
