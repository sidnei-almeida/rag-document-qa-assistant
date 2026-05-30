import {
  INDEX_POLL_TIMEOUT_MS,
  LONG_REQUEST_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  UPLOAD_TIMEOUT_MS,
} from './config.js';

export async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function requestJson(url, options = {}, timeout = REQUEST_TIMEOUT_MS) {
  const response = await fetchWithTimeout(url, options, timeout);
  const text = await response.text().catch(() => '');
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new Error('Invalid JSON response.');
      }
    }
  }
  if (!response.ok) {
    const message = data?.detail || data?.error?.message || text || `Status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data ?? {};
}

export { LONG_REQUEST_TIMEOUT_MS, UPLOAD_TIMEOUT_MS, INDEX_POLL_TIMEOUT_MS };
