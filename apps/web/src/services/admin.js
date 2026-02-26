const API = '/api/v1';

export async function getAdminStats() {
  const res = await fetch(`${API}/admin/stats`);
  if (!res.ok) throw new Error('Failed to load admin stats');
  const { data } = await res.json();
  return data;
}

export function exportRequestsCSVUrl() {
  return `${API}/admin/export/requests.csv`;
}

export function exportAssignmentsCSVUrl() {
  return `${API}/admin/export/assignments.csv`;
}

export async function getChurchSettings(churchId) {
  const res = await fetch(`${API}/churches/${churchId}/settings`);
  if (!res.ok) throw new Error('Church not found');
  const { data } = await res.json();
  return data;
}

export async function updateChurchSettings(churchId, payload) {
  const res = await fetch(`${API}/churches/${churchId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to update settings');
  }
  const { data } = await res.json();
  return data;
}
