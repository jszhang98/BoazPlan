const BASE = '/api/v1/churches';

export async function createChurch({ name, slug, location, privacyMode }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug, location, privacyMode }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to create church');
  }
  return json.data;
}

export async function getChurch(id) {
  const res = await fetch(`${BASE}/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Not found');
  return json.data;
}

export async function updateChurch(id, updates) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to update church');
  return json.data;
}
