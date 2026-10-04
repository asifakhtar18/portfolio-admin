"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api/client"
import { safeNextPath, DEFAULT_PROTECTED_ROUTE } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { GoogleButton, AuthDivider } from "@/components/google-button"
import { OtpVerification } from "@/components/otp-verification"
import { toast } from "sonner"

/**
 * Registration form. Matches the sign-in form's editorial styling (borderless,
 * tall inputs, password toggle). Beyond email/username/password it now offers
 * "Continue with Google" (R6.1) and switches to the OTP code-entry step when
 * the backend reports the account needs email verification (R6.2) — the user
 * only enters the app after verification succeeds. When email OTP is disabled
 * the backend issues a token immediately and the OTP step is skipped (R6.6).
 * All auth calls go through `src/lib/api/*`; errors surface via toast (R6.4).
 */
export function RegisterForm() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showOtp, setShowOtp] = useState(false)

    const { register } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const next = safeNextPath(searchParams.get("next"))

    const goToApp = () => router.push(next ?? DEFAULT_PROTECTED_ROUTE)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const result = await register(email, username, password)
            if (result.kind === "pending_verification") {
                // OTP required (or email exists but unverified): collect the code.
                setShowOtp(true)
                return
            }
            goToApp()
        } catch (error) {
            const message = error instanceof ApiError ? error.message : "Failed to register"
            console.error("Registration error:", error)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (showOtp) {
        return (
            <OtpVerification
                email={email}
                onVerified={goToApp}
                onBack={() => setShowOtp(false)}
            />
        )
    }

    return (
        <div className="space-y-4">
            <GoogleButton disabled={isLoading} />
            <AuthDivider />
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                        id="register-email"
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
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                        id="register-username"
                        type="text"
                        placeholder="yourusername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        className="h-11"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                        <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
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
                            <Spinner size="sm" className="mr-2 border-primary-foreground" /> Creating account…
                        </>
                    ) : (
                        <>
                            Create account
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
