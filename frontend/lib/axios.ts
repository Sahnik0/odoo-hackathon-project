import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './token-store';
import type { ApiErrorBody } from '@/types/api';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// Single shared instance. `withCredentials` so the httpOnly refresh cookie
// (scoped to /auth by the backend) rides along on refresh calls.
export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Deduplicate concurrent 401s into a single /auth/refresh call (Section 9:
// "silent access-token refresh on 401 before failing the original request").
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<{ success: true; data: { accessToken: string } }>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        const token = res.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetryableConfig | undefined;
    const isRefreshRoute = original?.url === '/auth/refresh';

    if (error.response?.status === 401 && original && !original._retried && !isRefreshRoute) {
      original._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      // Refresh failed → session is over. Let the caller's own error handling
      // (or AuthProvider's redirect) take it from here.
    }
    return Promise.reject(error);
  },
);

export { refreshAccessToken };

/** Unwraps the {success,data} envelope and normalizes errors to a plain message. */
export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(err) && err.response?.data?.error) {
    return err.response.data.error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function apiErrorFields(err: unknown): Record<string, string> | undefined {
  if (axios.isAxiosError<ApiErrorBody>(err) && err.response?.data?.error) {
    return err.response.data.error.fields;
  }
  return undefined;
}
