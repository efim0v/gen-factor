const isDevelopment = import.meta.env.DEV;

/**
 * Универсальный HTTP-клиент
 * - dev: Vite proxy → /api
 * - prod (Vercel): API Route → /api/blup?path=
 */
export const authenticatedFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = isDevelopment
    ? `/api${endpoint}`
    : `/api/blup?path=${encodeURIComponent(endpoint)}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
};

export const apiGet = <T>(endpoint: string): Promise<T> =>
  authenticatedFetch<T>(endpoint, { method: 'GET' });

export const apiPost = <T>(endpoint: string, body: unknown): Promise<T> =>
  authenticatedFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
