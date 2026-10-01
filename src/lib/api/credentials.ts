// Credentials API module (Requirement 2, 17.6).
//
// Submits/updates the tenant's own Storage_Credentials (MongoDB URI + Vercel
// Blob token) via `PUT /credentials`. The API validates and encrypts them
// before storing; the response never echoes the credentials, only a
// `storageConfigured` flag.

import { apiSend } from "./client";

/** Body for `PUT /credentials`. */
export interface CredentialsInput {
  mongoUri: string;
  blobToken: string;
}

/** Response of `PUT /credentials` — the API returns only the configured flag. */
export interface CredentialsResponse {
  storageConfigured: boolean;
}

/**
 * Submit or update the tenant's Storage_Credentials (R2.1–R2.5). On invalid
 * credentials the API responds 400 and the client throws an `ApiError` carrying
 * the validation message.
 */
export function putCredentials(
  input: CredentialsInput,
): Promise<CredentialsResponse> {
  return apiSend<CredentialsResponse>("PUT", "/credentials", input);
}
