// Public (browser-exposed) feature flags for the admin auth surfaces.
//
// The backend gates Google sign-in and email OTP with the server-only env vars
// `ENABLE_GOOGLE_AUTH` and `ENABLE_EMAIL_OTP`. Those are NOT exposed to the
// browser, so the UI reads parallel `NEXT_PUBLIC_*` flags to decide what to
// render. These MUST mirror the backend flags — set them together:
//
//   NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true   # mirror of API ENABLE_GOOGLE_AUTH
//   NEXT_PUBLIC_ENABLE_EMAIL_OTP=true     # mirror of API ENABLE_EMAIL_OTP
//
// Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, so these must be
// referenced as full static property accesses (not computed) to be replaced.
//
// Degrade-gracefully contract (R6.6):
//   - When `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== "true"`, hide the Google button.
//   - `NEXT_PUBLIC_ENABLE_EMAIL_OTP` gates only the PROACTIVE "verify your
//     email" entry link. The OTP code-entry step itself still runs whenever the
//     backend returns `pendingVerification` / `email_not_verified`, because the
//     backend response is the source of truth for routing into OTP.

/** True when the "Continue with Google" button should be shown (R6.1, R6.6). */
export const GOOGLE_AUTH_ENABLED =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true"

/**
 * True when the proactive "verify your email / resend code" entry link should
 * be shown (R6.5, R6.6). Does NOT gate the OTP step reached via a backend
 * `pendingVerification` / `email_not_verified` response.
 */
export const EMAIL_OTP_ENABLED =
    process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === "true"
