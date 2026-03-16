













// src/lib/api.js

const joinUrl = (base, path) => {
  const cleanedBase = (base || '').replace(/\/+$/, '');
  const cleanedPath = (path || '').startsWith('/') ? path : `/${path || ''}`;
  return `${cleanedBase}${cleanedPath}`;
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return typeof parsed?.token === 'string' ? parsed.token : '';
  } catch {
    return '';
  }
};

export const authFetch = async (path, options = {}) => {
  const { headers, ...rest } = options;
  const token = getStoredToken();
  return fetch(joinUrl(API_BASE_URL, path), {
    ...rest,
    headers: {
      ...(token && !(headers || {})?.Authorization ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    }
  });
};

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, headers, signal } = options;
  const token = getStoredToken();

  const res = await fetch(joinUrl(API_BASE_URL, path), {
    method,
    headers: {
      ...(token && !(headers || {})?.Authorization ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {})
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

  if (!res.ok) {
    const message =
      typeof payload === 'string' && payload.trim()
        ? payload
        : payload && typeof payload === 'object'
          ? JSON.stringify(payload)
          : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
};
