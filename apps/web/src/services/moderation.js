export async function getModerationQueue(status) {
  const qs = status ? `?status=${status}` : '';
  const res = await fetch(`/api/v1/moderation/queue${qs}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to load queue');
  return json.data;
}

export async function getHiddenRequests() {
  const res = await fetch('/api/v1/moderation/hidden');
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to load hidden requests');
  return json.data;
}

export async function moderateRequest(requestId, payload) {
  const res = await fetch(`/api/v1/moderation/requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Moderation action failed');
  return json.data;
}

export async function getModerationActions(requestId) {
  const res = await fetch(`/api/v1/moderation/requests/${requestId}/actions`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to load moderation history');
  return json.data;
}

export async function submitReport(requestId, payload) {
  const res = await fetch(`/api/v1/requests/${requestId}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Report submission failed');
  return json.data;
}

export async function getAuditLogs(filters = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  const res = await fetch(`/api/v1/audit-logs${qs ? `?${qs}` : ''}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to load audit logs');
  return json;
}
