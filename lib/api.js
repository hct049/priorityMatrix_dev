// /api/proxy를 통해 GAS 백엔드를 호출합니다.
export async function apiGet(action) {
  const r = await fetch(`/api/proxy?action=${action}`);
  return r.json();
}

export async function apiPost(body) {
  const r = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}
