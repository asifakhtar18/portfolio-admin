// Auth API module: register, login, and identity (Requirements 4, 5, 17.3).
//
// Replaces the Firebase Auth calls in the admin. Register and login return a
// JWT that the auth context (task 20.2) stores; `me()` returns the tenant's
// profile including the `storageConfigured` flag.

import { apiGet, apiSend } from "./client";
import type { AuthTokenResponse, TenantProfile } from "./types";

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

/**
 * Register a new tenant. Returns the issued JWT (R4.1). The caller is
 * responsible for persisting the token via the auth context.
 */
export function register(input: RegisterInput): Promise<AuthTokenResponse> {
  return apiSend<AuthTokenResponse>("POST", "/auth/register", input);
}

/** Log in an existing tenant. Returns the issued JWT (R5.1). */
export function login(input: LoginInput): Promise<AuthTokenResponse> {
  return apiSend<AuthTokenResponse>("POST", "/auth/login", input);
}

/**
 * Fetch the authenticated tenant's profile (R5.3). Requires a stored JWT; the
 * response includes `storageConfigured` so the UI can prompt the tenant to set
 * up their storage credentials.
 */
export function me(): Promise<TenantProfile> {
  return apiGet<TenantProfile>("/auth/me");
}
