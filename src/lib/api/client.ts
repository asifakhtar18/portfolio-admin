// Base HTTP client for the portfolio-admin CMS.
//
// This module is the single entry point through which every admin API module
// talks to `portfolio-api`. It replaces the direct Firebase SDK access that the
// admin previously used (Requirement 17.2): all CRUD now flows through HTTP
// requests to the API, and every protected request carries the tenant's JWT in
// the `Authorization: Bearer <token>` header (Requirement 17.3).

/**
 * localStorage key under which the tenant's JWT is stored. The auth context
 * (task 20.2) writes/clears this key on login, registration, and logout; the
 * API client reads it on every request to inject the Bearer token.
 */
export const TOKEN_STORAGE_KEY = "portfolio_admin_token";

/**
 * Base URL of the `portfolio-api` service. Configured via the
 * `NEXT_PUBLIC_API_BASE_URL` env var (exposed to the browser by Next.js). Falls
 * back to the local dev server when unset. Any trailing slash is trimmed so
 * paths can be joined without producing a double slash.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

/**
 * Error thrown for any non-2xx API response. Carries the HTTP `status` and the
 * API's `{ error }` message (when present) so callers and UI can surface a
 * meaningful message.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Read the stored JWT from localStorage. Returns `null` when unavailable —
 * either because there is no token or because the code is running server-side
 * (Next.js SSR/prerender), where `window` is undefined.
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Persist the JWT to localStorage. No-op on the server. */
export function setStoredToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/** Remove the stored JWT from localStorage. No-op on the server. */
export function clearStoredToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Join the API base URL with a request path. The path may be given with or
 * without a leading slash.
 */
function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Core authenticated fetch used by every admin API module.
 *
 * Behavior:
 *   - prepends {@link API_BASE_URL} to `path`;
 *   - injects `Authorization: Bearer <token>` when a JWT is stored (R17.3);
 *   - sets `Content-Type: application/json` for JSON request bodies, but leaves
 *     it unset for `FormData` bodies so the browser can set the correct
 *     `multipart/form-data` boundary (used by image uploads);
 *   - parses a JSON response body when present and returns it as `T`;
 *   - throws an {@link ApiError} carrying the API's `{ error }` message on any
 *     non-2xx response.
 *
 * @typeParam T the expected parsed response type
 * @param path API path (e.g. `/projects` or `projects`)
 * @param options standard fetch options; `body` may be a JSON string or FormData
 * @returns the parsed JSON response body, or `undefined` for empty (204) responses
 */
export async function fetchWithAuth<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set a JSON content type for non-FormData bodies. For FormData we must
  // NOT set Content-Type so the browser adds the multipart boundary itself.
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), { ...options, headers });

  // Attempt to parse a JSON body; tolerate empty bodies (e.g. 204 No Content).
  const text = await response.text();
  const data = text.length > 0 ? (JSON.parse(text) as unknown) : undefined;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

/** Convenience helper: authenticated GET returning parsed JSON. */
export function apiGet<T>(path: string): Promise<T> {
  return fetchWithAuth<T>(path, { method: "GET" });
}

/** Convenience helper: authenticated request with a JSON body. */
export function apiSend<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  return fetchWithAuth<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

/** Convenience helper: authenticated request with a FormData (multipart) body. */
export function apiSendForm<T>(
  method: "POST" | "PUT" | "PATCH",
  path: string,
  form: FormData,
): Promise<T> {
  return fetchWithAuth<T>(path, { method, body: form });
}
