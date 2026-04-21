const COMMAC_BASE_URL = process.env['COMMAC_BASE_URL'] ?? 'http://localhost:8020/api';

export async function apiFetch(params: URLSearchParams, signal?: AbortSignal): Promise<Response> {
  const url = `${COMMAC_BASE_URL}/pruebas/peticionPantallaConEspera?${params}`;
  return fetch(url, { method: 'POST', ...(signal !== undefined ? { signal } : {}) });
}
