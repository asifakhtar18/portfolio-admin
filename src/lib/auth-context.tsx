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
    /** Log in with email/password; stores the JWT and loads the profile (R17.3). */
    login: (email: string, password: string) => Promise<void>
    /** Register a new tenant; stores the JWT and loads the profile (R17.5). */
    register: (email: string, username: string, password: string) => Promise<void>
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
    login: async () => {},
    register: async () => {},
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

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true)
        try {
            const { token: newToken } = await apiLogin({ email, password })
            setStoredToken(newToken)
            const profile = await apiMe()
            setToken(newToken)
            setTenant(profile)
        } catch (error) {
            // Leave the session untouched on failure so callers can surface the
            // error without a half-authenticated state.
            clearStoredToken()
            setToken(null)
            setTenant(null)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const register = useCallback(
        async (email: string, username: string, password: string) => {
            setLoading(true)
            try {
                const { token: newToken } = await apiRegister({ email, username, password })
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
        },
        [],
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
        logout,
        refreshProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
