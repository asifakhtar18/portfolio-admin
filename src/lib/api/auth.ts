// Auth API module: register, login, OTP verification, Google sign-in, and
// identity (Requirements 4, 5, 6, 17.3).
//
// Replaces the Firebase Auth calls in the admin. Register and login return a
// JWT that the auth context stores; `me()` returns the tenant's profile
// including `storageConfigured` and `emailVerified`. OTP verification and
// resend back the email-OTP signup path, and `googleSignInUrl()` yields the
// absolute initiate URL the UI navigates the browser to for Google sign-in.
//
// Every call flows through the `./client` helpers (`apiGet`/`apiSend`); no raw
// `fetch` is used here (R6.4). Google initiate is a full-page browser redirect,
// so this module returns the URL string for the UI to navigate to rather than
// fetching it.

import { ApiError, API_BASE_URL, apiGet, apiSend } from "./client";
import type {
  AuthTokenResponse,
  RegisterResponse,
  ResendOtpResponse,
  TenantProfile,
} from "./types";

/** Credentials for `POST /auth/register`. */
export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

/** Credentials for `POST /auth/login`. */
export interface LoginInput {
  email: string;
  password: string;
}

/** Body for `POST /auth/verify-otp`. */
export interface VerifyOtpInput {
  email: string;
  code: string;
}

/** Body for `POST /auth/resend-otp`. */
export interface ResendOtpInput {
  email: string;
}

/**
 * The outcome of a login attempt, discriminated by `kind`:
 *   - `token`: credentials were valid and a JWT was issued; the caller persists
 *     it and loads the profile.
 *   - `email_not_verified`: credentials were valid but the tenant has not yet
 *     verified their email (API `403 { error: "email_not_verified" }`); the UI
 *     should route into the OTP step and auto-resend (R6.3).
 *
 * Any other failure (bad credentials, etc.) still throws {@link ApiError}, so
 * the caller surfaces it via the usual toast/error pattern.
 */
export type LoginResult =
  | { kind: "token"; token: string }
  | { kind: "email_not_verified" };

/**
 * Register a new tenant.
 *
 * Returns a {@link RegisterResponse} union: when email OTP is disabled the API
 * issues a JWT (`{ token }`, R4.1); when OTP is enabled — or the email already
 * exists but is unverified — the API responds `202 { pendingVerification: true }`
 * and no token. Callers narrow on the shape (`"token" in res`) to decide
 * whether to store the token or route into the OTP step.
 */
export function register(input: RegisterInput): Promise<RegisterResponse> {
  return apiSend<RegisterResponse>("POST", "/auth/register", input);
}

/**
 * Log in an existing tenant via a discriminated result (R5.1, R6.3).
 *
 * On success returns `{ kind: "token", token }`. For valid credentials on an
 * unverified tenant the API returns `403 { error: "email_not_verified" }`,
 * which this wrapper translates to `{ kind: "email_not_verified" }` so the UI
 * can route to OTP entry without inspecting raw error status. Any other non-2xx
 * response (e.g. bad credentials) is rethrown as the original {@link ApiError}.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  try {
    const { token } = await rawLogin(input);
    return { kind: "token", token };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 403 &&
      error.message === "email_not_verified"
    ) {
      return { kind: "email_not_verified" };
    }
    throw error;
  }
}

/**
 * Low-level `POST /auth/login` that returns the raw {@link AuthTokenResponse}
 * and throws {@link ApiError} on any non-2xx response (a `403` carries status
 * `403` and message `"email_not_verified"`). Prefer {@link login}, which maps
 * the unverified outcome to a typed result; this is exposed for callers that
 * want the raw token response.
 */
export function rawLogin(input: LoginInput): Promise<AuthTokenResponse> {
  return apiSend<AuthTokenResponse>("POST", "/auth/login", input);
}

/**
 * Verify an email OTP code (`POST /auth/verify-otp`). On success the API issues
 * a JWT ({@link AuthTokenResponse}); a bad or expired code yields a `401` that
 * is thrown as {@link ApiError} for the UI to surface (R6.2).
 */
export function verifyOtp(input: VerifyOtpInput): Promise<AuthTokenResponse> {
  return apiSend<AuthTokenResponse>("POST", "/auth/verify-otp", input);
}

/**
 * Request a fresh OTP code (`POST /auth/resend-otp`). The API responds
 * uniformly with `202 { ok: true }` regardless of whether the email exists, so
 * no account-existence information leaks (R6.2, R6.5).
 */
export function resendOtp(input: ResendOtpInput): Promise<ResendOtpResponse> {
  return apiSend<ResendOtpResponse>("POST", "/auth/resend-otp", input);
}

/**
 * The absolute URL of the backend Google OAuth initiate endpoint
 * (`GET /auth/google`). Google sign-in is a full-page browser redirect, so the
 * UI navigates to this URL (`window.location.href = googleSignInUrl()`) rather
 * than fetching it. Built from {@link API_BASE_URL} so it points at the
 * configured API host (R6.1).
 */
export function googleSignInUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}

/**
 * Fetch the authenticated tenant's profile (R5.3). Requires a stored JWT; the
 * response includes `storageConfigured` so the UI can prompt the tenant to set
 * up their storage credentials, and `emailVerified` so verified-gating can be
 * reflected in the UI.
 */
export function me(): Promise<TenantProfile> {
  return apiGet<TenantProfile>("/auth/me");
}
