// The access token lives ONLY in memory (Section 2 — never localStorage). A
// plain module-level variable, not React state, so the Axios interceptor
// (outside the component tree) can always read the current value
// synchronously. AuthProvider (contexts/auth-context.tsx) is the only writer;
// it mirrors this into React state for components that need to re-render.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
