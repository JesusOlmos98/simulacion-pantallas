const NEXT_PUBLIC_COMMAC_BASE_URL = process.env['NEXT_PUBLIC_COMMAC_BASE_URL'] ?? 'http://localhost:8020/api';

export async function apiFetch(params: URLSearchParams, signal?: AbortSignal): Promise<Response> {
  const url = `${NEXT_PUBLIC_COMMAC_BASE_URL}/pruebas/peticionPantallaConEspera?${params}`;
  return fetch(url, { method: 'POST', ...(signal !== undefined ? { signal } : {}) });
}
