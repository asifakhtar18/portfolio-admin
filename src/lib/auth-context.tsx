"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

import { login as apiLogin, me as apiMe, register as apiRegister } from "@/lib/api/auth"
import {
    clearStoredToken,
    getStoredToken,
    setStoredToken,
} from "@/lib/api/client"
import type { TenantProfile } from "@/lib/api/types"

/**
 * The result of a `login` attempt surfaced to the UI.
 *   - `token`: credentials valid and verified; the session is now established.
 *   - `email_not_verified`: valid credentials but the email is unverified; the
 *     form routes into the OTP step and auto-resends a code (R6.3).
 *
 * Any other failure (bad credentials, etc.) still throws {@link ApiError} so
 * the caller surfaces it via the usual toast pattern (R6.4).
 */
export type LoginOutcome =
    | { kind: "token" }
    | { kind: "email_not_verified" }

/**
 * The result of a `register` attempt surfaced to the UI.
 *   - `token`: email OTP is disabled, a JWT was issued, and the session is now
 *     established (OTP step is skipped, R6.6).
 *   - `pending_verification`: email OTP is required (or the email exists but is
 *     unverified); no token yet, so the form routes into the OTP step (R6.2).
 */
export type RegisterOutcome =
    | { kind: "token" }
    | { kind: "pending_verification" }

/**
 * Auth context for the portfolio-admin CMS.
 *
 * Replaces the previous Firebase Auth context (Requirement 17). The tenant's
 * identity now comes from the API: a JWT (stored in localStorage and read by
 * `fetchWithAuth`, R17.3) plus the tenant profile returned by `/auth/me`
 * (which carries `storageConfigured`, R17.4/R17.6).
 */
interface AuthContextType {
    /** The authenticated tenant's profile, or `null` when logged out. */
    tenant: TenantProfile | null
    /** The current JWT, or `null` when logged out. Mirrors localStorage. */
    token: string | null
    /** Whether the tenant has configured valid Storage_Credentials (R17.4). */
    storageConfigured: boolean
    /** True while the initial session restore / an auth action is in flight. */
    loading: boolean
    /** Convenience flag: a session exists when both a token and tenant are present. */
    isAuthenticated: boolean
    /**
     * Log in with email/password. Returns a {@link LoginOutcome} so the UI can
     * branch on the unverified-email case (R6.3) instead of catching a sentinel
     * error. On `token` the JWT is stored and the profile loaded (R17.3). Other
     * failures throw {@link ApiError}.
     */
    login: (email: string, password: string) => Promise<LoginOutcome>
    /**
     * Register a new tenant. Returns a {@link RegisterOutcome}: `token` when OTP
     * is disabled (session established) or `pending_verification` when the OTP
     * step is required (R6.2). Other failures throw {@link ApiError}.
     */
    register: (email: string, username: string, password: string) => Promise<RegisterOutcome>
    /**
     * Establish a session from an already-issued JWT: store it and load the
     * profile. Used by the OTP-success path and the Google sign-in handoff
     * (both receive a token out-of-band from the password-login flow), reusing
     * the exact same storage + profile-load steps as `login` (R6.1, R6.2).
     */
    completeWithToken: (token: string) => Promise<void>
    /** Clear the session (token + state). */
    logout: () => void
    /** Reload the tenant profile from `/auth/me` (e.g. after saving credentials). */
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    tenant: null,
    token: null,
    storageConfigured: false,
    loading: true,
    isAuthenticated: false,
    login: async () => ({ kind: "token" }),
    register: async () => ({ kind: "token" }),
    completeWithToken: async () => {},
    logout: () => {},
    refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<TenantProfile | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // On mount, restore the session from localStorage. If a token exists we
    // validate it by loading the profile; a failure (expired/invalid) clears
    // the token and leaves us logged out.
    useEffect(() => {
        const storedToken = getStoredToken()
        if (!storedToken) {
            setLoading(false)
            return
        }

        let cancelled = false
        apiMe()
            .then((profile) => {
                if (cancelled) return
                setToken(storedToken)
                setTenant(profile)
            })
            .catch(() => {
                if (cancelled) return
                clearStoredToken()
                setToken(null)
                setTenant(null)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    // Store a JWT and load the profile. Shared by login, OTP success, and the
    // Google handoff. On failure the session is left clean so the caller can
    // surface the error without a half-authenticated state.
    const establishSession = useCallback(async (newToken: string) => {
        setLoading(true)
        try {
            setStoredToken(newToken)
            const profile = await apiMe()
            setToken(newToken)
            setTenant(profile)
        } catch (error) {
            clearStoredToken()
            setToken(null)
            setTenant(null)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const login = useCallback(
        async (email: string, password: string): Promise<LoginOutcome> => {
            const result = await apiLogin({ email, password })
            if (result.kind !== "token") {
                // Valid credentials but the email is not yet verified. Leave the
                // session unset and let the caller route into the OTP step and
                // auto-resend (R6.3).
                return { kind: "email_not_verified" }
            }
            await establishSession(result.token)
            return { kind: "token" }
        },
        [establishSession],
    )

    const register = useCallback(
        async (email: string, username: string, password: string): Promise<RegisterOutcome> => {
            const result = await apiRegister({ email, username, password })
            if (!("token" in result)) {
                // Email OTP is enabled (or the email already exists and is
                // unverified): no token yet. Leave the session unset; the caller
                // routes into the OTP step to complete verification (R6.2).
                return { kind: "pending_verification" }
            }
            await establishSession(result.token)
            return { kind: "token" }
        },
        [establishSession],
    )

    const completeWithToken = useCallback(
        (newToken: string) => establishSession(newToken),
        [establishSession],
    )

    const logout = useCallback(() => {
        clearStoredToken()
        setToken(null)
        setTenant(null)
    }, [])

    const refreshProfile = useCallback(async () => {
        if (!getStoredToken()) return
        const profile = await apiMe()
        setTenant(profile)
    }, [])

    const value: AuthContextType = {
        tenant,
        token,
        storageConfigured: tenant?.storageConfigured ?? false,
        loading,
        isAuthenticated: !!token && !!tenant,
        login,
        register,
        completeWithToken,
        logout,
        refreshProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
