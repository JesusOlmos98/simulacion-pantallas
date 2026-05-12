export async function apiFetch(params: URLSearchParams, signal?: AbortSignal): Promise<Response> {
  const url = `/api/pantalla?${params}`;
  return fetch(url, { method: 'POST', ...(signal !== undefined ? { signal } : {}) });
}
