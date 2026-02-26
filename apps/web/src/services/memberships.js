const BASE = (churchId) => `/api/v1/churches/${churchId}/members`;

export async function addMember(churchId, { userId, role = 'member' }) {
  const res = await fetch(BASE(churchId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to add member');
  return json.data;
}

export async function listMembers(churchId) {
  const res = await fetch(BASE(churchId));
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to list members');
  return json.data;
}

export async function updateMemberRole(churchId, userId, role) {
  const res = await fetch(`${BASE(churchId)}/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to update role');
  return json.data;
}

export async function removeMember(churchId, userId) {
  const res = await fetch(`${BASE(churchId)}/${userId}`, { method: 'DELETE' });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error?.message || 'Failed to remove member');
  }
}
