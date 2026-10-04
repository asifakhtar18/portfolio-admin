"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { resendOtp, verifyOtp } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

/** Backend resend cooldown is 60s (D-C); the client timer mirrors it. */
const RESEND_COOLDOWN_SECONDS = 60
/** OTP codes are 6-digit numeric (D-C). */
const CODE_LENGTH = 6

export interface OtpVerificationProps {
    /** The email the OTP was sent to; passed to verify/resend. */
    email: string
    /**
     * When true, a resend is triggered automatically on mount. Used for the
     * login `email_not_verified` outcome where the backend already (re)issued a
     * code and the UI confirms a fresh one is on its way (R6.3).
     */
    autoResend?: boolean
    /** Called after a successful verification + session establishment. */
    onVerified: () => void
    /** Called when the user leaves the OTP step to return to the form. */
    onBack: () => void
}

/**
 * Email OTP code-entry step (R6.2, R6.3, R6.5).
 *
 * Collects the 6-digit numeric code, verifies it via the API, and on success
 * stores the issued JWT + loads the profile through the auth context (the same
 * path as a password login) before handing control back to the caller to route
 * into the app. Offers a "Resend code" action gated by a 60s cooldown that
 * matches the backend. All feedback flows through `sonner` toasts and inline
 * state (R6.4); every call goes through `src/lib/api/*` (no raw fetch).
 */
export function OtpVerification({ email, autoResend, onVerified, onBack }: OtpVerificationProps) {
    const { completeWithToken } = useAuth()
    const [code, setCode] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    // Resend a code and start the cooldown. Memoized so the auto-resend effect
    // has a stable dependency.
    const handleResend = useCallback(async () => {
        setIsResending(true)
        try {
            await resendOtp({ email })
            setCooldown(RESEND_COOLDOWN_SECONDS)
            toast.success(`We sent a new code to ${email}.`)
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to resend code"
            console.error("Resend OTP error:", error)
            toast.error(message)
        } finally {
            setIsResending(false)
        }
    }, [email])

    // Auto-resend once on mount for the login re-entry path (R6.3). The ref
    // guards against a double-run (e.g. React StrictMode in dev).
    const autoResendDone = useRef(false)
    useEffect(() => {
        if (autoResend && !autoResendDone.current) {
            autoResendDone.current = true
            void handleResend()
        }
    }, [autoResend, handleResend])

    // Count the cooldown down to zero.
    useEffect(() => {
        if (cooldown <= 0) return
        const id = setInterval(() => {
            setCooldown((c) => (c <= 1 ? 0 : c - 1))
        }, 1000)
        return () => clearInterval(id)
    }, [cooldown])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length !== CODE_LENGTH) {
            toast.error(`Enter the ${CODE_LENGTH}-digit code from your email.`)
            return
        }
        setIsVerifying(true)
        try {
            const { token } = await verifyOtp({ email, code })
            await completeWithToken(token)
            toast.success("Email verified.")
            onVerified()
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Verification failed"
            console.error("Verify OTP error:", error)
            toast.error(message)
            setCode("")
        } finally {
            setIsVerifying(false)
        }
    }

    const busy = isVerifying || isResending

    return (
        <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="otp-code">Verification code</Label>
                <Input
                    id="otp-code"
                    name="otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d*"
                    maxLength={CODE_LENGTH}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
                    required
                    autoFocus
                    className="h-11 text-center text-lg tracking-[0.5em]"
                    aria-describedby="otp-help"
                />
                <p id="otp-help" className="text-sm text-muted-foreground">
                    Enter the {CODE_LENGTH}-digit code we sent to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                </p>
            </div>

            <Button type="submit" className="group h-11 w-full" disabled={busy || code.length !== CODE_LENGTH}>
                {isVerifying ? (
                    <>
                        <Spinner size="sm" className="mr-2 border-primary-foreground" /> Verifying…
                    </>
                ) : (
                    <>
                        Verify email
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                )}
            </Button>

            <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={busy || cooldown > 0}
                    className="font-medium text-primary underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                    {isResending
                        ? "Sending…"
                        : cooldown > 0
                          ? `Resend code in ${cooldown}s`
                          : "Resend code"}
                </button>
            </div>
        </form>
    )
}
