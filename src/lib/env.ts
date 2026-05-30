/**
 * Vite environment variables exposed to the client.
 */

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

/** Hugging Face Space — backend em produção. */
export const DEFAULT_API_URL = 'https://salmeida-my-rag-chatbot.hf.space';

/** Backend API base URL (no trailing slash). */
export function readApiBaseUrl(): string {
  const env = import.meta.env;
  const raw =
    env.VITE_API_URL ||
    env.VITE_API_BASE_URL ||
    env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_URL;
  return trimTrailingSlash(String(raw));
}

export const API_BASE_URL = readApiBaseUrl();

export const APP_NAME = String(import.meta.env.VITE_APP_NAME || 'DocMind');
