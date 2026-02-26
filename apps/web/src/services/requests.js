export async function createRequest(payload) {
  const res = await fetch('/api/v1/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Request failed');
  return json.data;
}

export async function listRequests(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  const res = await fetch(`/api/v1/requests${qs ? `?${qs}` : ''}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch requests');
  return json.data;
}

export async function getRequest(id) {
  const res = await fetch(`/api/v1/requests/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Not found');
  return json.data;
}

export async function updateRequest(id, payload) {
  const res = await fetch(`/api/v1/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Update failed');
  return json.data;
}
