const API_BASE = '/api/support'; // External backend base

interface ApiOptions {
  headers?: Record<string, string>;
}

async function getAuthToken(): Promise<string | null> {
  // Try cookie first (app pattern)
  const name = 'authToken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let c of ca) {
    c = c.trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  // Fallback localStorage
  return localStorage.getItem('authToken') || null;
}

export async function serverCallFunction<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {},
  useAuth = true
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = useAuth ? await getAuthToken() : null;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'x-auth-token': token }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    return Promise.reject(error);
  }
  
  return response.json();
}

// Convenience methods
export const api = {
  post: <T>(endpoint: string, body: Record<string, any>, auth = true) => 
    serverCallFunction<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }, auth),
  get: <T>(endpoint: string, auth = true) => 
    serverCallFunction<T>(endpoint, { method: 'GET' }, auth),
  put: <T>(endpoint: string, body: Record<string, any>, auth = true) => 
    serverCallFunction<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }, auth),
};

