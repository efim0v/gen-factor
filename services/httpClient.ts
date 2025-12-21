const isDevelopment = import.meta.env.DEV;

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
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const apiGet = <T>(endpoint: string): Promise<T> => {
  return authenticatedFetch<T>(endpoint, { method: 'GET' });
};

export const apiPost = <T>(endpoint: string, body: unknown): Promise<T> => {
  return authenticatedFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};
