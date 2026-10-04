"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api/client"
import { EMAIL_OTP_ENABLED } from "@/lib/feature-flags"
import { safeNextPath, DEFAULT_PROTECTED_ROUTE } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { GoogleButton, AuthDivider } from "@/components/google-button"
import { OtpVerification } from "@/components/otp-verification"
import { toast } from "sonner"

/** Which sub-view the auth surface is showing. */
type View =
    | { step: "login" }
    // OTP code entry; `autoResend` is true for the login re-entry path (R6.3).
    | { step: "otp"; email: string; autoResend: boolean }
    // Collect an email for the standalone "verify your email" entry (R6.5).
    | { step: "resend" }

/**
 * Sign-in form. Borderless on the editorial auth surface (the hero carries the
 * visual weight). Beyond email/password it now handles:
 *   - "Continue with Google" (R6.1) and the OAuth callback handoff on this page;
 *   - routing to the OTP step with an auto-resend when login reports the email
 *     is unverified (R6.3);
 *   - a reachable "verify your email / resend code" entry (R6.5).
 * All auth calls go through `src/lib/api/*`; errors surface via toast (R6.4).
 */
export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [view, setView] = useState<View>({ step: "login" })
    // The email collected on the standalone "verify your email" sub-view.
    const [resendEmail, setResendEmail] = useState("")

    const { login, completeWithToken } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = safeNextPath(searchParams.get("next"))

    const goToApp = () => router.push(next ?? DEFAULT_PROTECTED_ROUTE)

    // Handle the Google OAuth callback handoff. The backend callback redirects
    // the browser to `/login?google=success&token=<jwt>` (or `?google=error`).
    // On success we store the token + load the profile via the auth context —
    // the same path as a password login — then route into the app. The query
    // params are cleaned afterwards so a refresh doesn't re-trigger this.
    const googleHandled = useRef(false)
    useEffect(() => {
        if (googleHandled.current) return
        const googleStatus = searchParams.get("google")
        if (!googleStatus) return
        googleHandled.current = true

        const cleanUrl = () => {
            if (typeof window !== "undefined") {
                window.history.replaceState(null, "", window.location.pathname)
            }
        }

        if (googleStatus === "success") {
            const token = searchParams.get("token")
            if (!token) {
                toast.error("Google sign-in did not return a session. Please try again.")
                cleanUrl()
                return
            }
            setIsLoading(true)
            completeWithToken(token)
                .then(() => {
                    cleanUrl()
                    goToApp()
                })
                .catch((error) => {
                    const message =
                        error instanceof ApiError ? error.message : "Google sign-in failed"
                    console.error("Google sign-in handoff error:", error)
                    toast.error(message)
                    cleanUrl()
                })
                .finally(() => setIsLoading(false))
        } else {
            toast.error("Google sign-in was cancelled or failed. Please try again.")
            cleanUrl()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await login(email, password)
            if (result.kind === "email_not_verified") {
                // Valid credentials but unverified: route to OTP and auto-resend.
                setView({ step: "otp", email, autoResend: true })
                return
            }
            goToApp()
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to sign in"
            console.error("Login error:", error)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const target = resendEmail.trim()
        if (!target) return
        // Hand off to the OTP step, which auto-sends a fresh code on mount.
        setView({ step: "otp", email: target, autoResend: true })
    }

    if (view.step === "otp") {
        return (
            <OtpVerification
                email={view.email}
                autoResend={view.autoResend}
                onVerified={goToApp}
                onBack={() => setView({ step: "login" })}
            />
        )
    }

    if (view.step === "resend") {
        return (
            <form onSubmit={handleResendSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="resend-email">Email</Label>
                    <Input
                        id="resend-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                        className="h-11"
                        aria-describedby="resend-help"
                    />
                    <p id="resend-help" className="text-sm text-muted-foreground">
                        We&apos;ll send a fresh verification code to this address.
                    </p>
                </div>
                <Button type="submit" className="group h-11 w-full">
                    Send verification code
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
                <button
                    type="button"
                    onClick={() => setView({ step: "login" })}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                </button>
            </form>
        )
    }

    return (
        <div className="space-y-4">
            <GoogleButton disabled={isLoading} />
            <AuthDivider />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-11"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="h-11 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-0 top-0 flex h-11 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <Button type="submit" className="group h-11 w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Spinner size="sm" className="mr-2 border-primary-foreground" /> Signing in…
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </>
                    )}
                </Button>
            </form>

            {EMAIL_OTP_ENABLED && (
                <p className="text-center text-sm text-muted-foreground lg:text-left">
                    Didn&apos;t verify your email?{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setResendEmail(email)
                            setView({ step: "resend" })
                        }}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Resend verification code
                    </button>
                </p>
            )}
        </div>
    )
}
