import { getUserFriendlyMessage, isAuthError } from './errorHandler';

const TOKEN_KEY = "auth_token";
const REQUEST_TIMEOUT = 15000;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  public statusCode: number;
  public responseBody: any;

  constructor(message: string, statusCode: number, responseBody?: any) {
    super(message);
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    this.name = 'ApiError';
  }
}

async function request(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      const errorMessage = body.error || res.statusText;

      if (res.status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/auth') {
          removeToken();
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }

      throw new ApiError(errorMessage, res.status, body);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      if (!navigator.onLine) {
        throw new ApiError('You are offline. Please check your internet connection.', 0);
      }
      throw new ApiError('Unable to reach the server. Please try again.', 0);
    }

    throw error;
  }
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, data?: any) => request(url, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: (url: string, data?: any) => request(url, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: (url: string) => request(url, { method: "DELETE" }),
};
