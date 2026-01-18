const isDevelopment = import.meta.env.DEV;

// Check if we're running on testserver (Docker deployment) or Vercel/Netlify
const isDockerDeployment = typeof window !== 'undefined' && 
  window.location.hostname.includes('testserver.tech');

/**
 * Универсальный HTTP-клиент
 * - dev: Vite proxy → /api
 * - prod (Docker/testserver): Direct /api/ path (nginx proxies to blup_api)
 * - prod (Vercel/Netlify): API Route → /api/blup?path=
 */
export const authenticatedFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let url: string;
  
  if (isDevelopment) {
    url = `/api${endpoint}`;
  } else if (isDockerDeployment) {
    // Docker deployment - nginx proxies /api/* to blup_api
    url = `/api${endpoint}`;
  } else {
    // Vercel/Netlify - use serverless function
    url = `/api/blup?path=${encodeURIComponent(endpoint)}`;
  }

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
