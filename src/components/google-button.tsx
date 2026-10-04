"use client"

import { googleSignInUrl } from "@/lib/api/auth"
import { GOOGLE_AUTH_ENABLED } from "@/lib/feature-flags"
import { Button } from "@/components/ui/button"

/** The Google "G" mark as an inline, multicolor SVG (decorative; the button text labels it). */
function GoogleMark() {
    return (
        <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
                fill="#FBBC05"
                d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
            />
            <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
            />
        </svg>
    )
}

/**
 * "Continue with Google" button (R6.1). Navigates the browser to the backend
 * OAuth initiate endpoint; the callback redirects back to `/login` with the
 * token. Rendered only when `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true"` so it is
 * hidden when the path is disabled (R6.6).
 */
export function GoogleButton({ disabled }: { disabled?: boolean }) {
    if (!GOOGLE_AUTH_ENABLED) return null

    const handleClick = () => {
        // Full-page redirect: Google OAuth cannot run inside an XHR.
        window.location.href = googleSignInUrl()
    }

    return (
        <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={handleClick}
            disabled={disabled}
            aria-label="Continue with Google"
        >
            <GoogleMark />
            Continue with Google
        </Button>
    )
}

/** A labelled "or" divider between the Google button and the email form. */
export function AuthDivider() {
    if (!GOOGLE_AUTH_ENABLED) return null
    return (
        <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
        </div>
    )
}
