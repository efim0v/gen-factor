// HTTP Client for BLUP API

const isDevelopment = import.meta.env.DEV;

// Generic fetch wrapper
export const authenticatedFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let url: string;

  if (isDevelopment) {
    // Development: Vite proxy
    url = `/api${endpoint}`;
  } else {
    // Production: direct backend request
    url = `http://92.50.154.150:45501/blup/api${endpoint}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// GET request helper
export const apiGet = <T>(endpoint: string): Promise<T> => {
  return authenticatedFetch<T>(endpoint, { method: 'GET' });
};

// POST request helper
export const apiPost = <T>(endpoint: string, body: unknown): Promise<T> => {
  return authenticatedFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};
