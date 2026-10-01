"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { putCredentials } from "@/lib/api/credentials"
import { ApiError } from "@/lib/api/client"

/**
 * Storage_Credentials settings form (Requirement 17.6).
 *
 * Lets the authenticated Tenant submit or replace their own storage
 * credentials (MongoDB URI + Vercel Blob token) via `PUT /credentials`. On
 * success it toasts and refreshes the auth profile so `storageConfigured`
 * updates across the app (R17.4/R17.6). On failure it surfaces the API's
 * `ApiError` message — this includes the validation error the API returns when
 * the credentials cannot connect / the token is rejected (R2.2).
 *
 * Security: both fields are secrets. They use password-type inputs, are never
 * pre-filled (the API never returns stored credentials, R2.4), and are cleared
 * after a successful save. Submitting always replaces whatever is stored (R2.5).
 */
export function CredentialsForm() {
    const { storageConfigured, refreshProfile } = useAuth()

    const [mongoUri, setMongoUri] = useState("")
    const [blobToken, setBlobToken] = useState("")
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await putCredentials({ mongoUri, blobToken })
            // Never keep secrets in component state after a successful save.
            setMongoUri("")
            setBlobToken("")
            await refreshProfile()
            toast("Storage credentials saved successfully")
        } catch (error) {
            // The API validates credentials before persisting (R2.1/R2.2); a
            // validation failure comes back as an ApiError with a descriptive
            // message that we surface directly to the tenant.
            const message =
                error instanceof ApiError
                    ? error.message
                    : "Failed to save storage credentials"
            toast(message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current status:</span>
                {storageConfigured ? (
                    <Badge>Storage configured</Badge>
                ) : (
                    <Badge variant="secondary">Not configured yet</Badge>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="mongoUri">MongoDB connection string</Label>
                    <Input
                        id="mongoUri"
                        name="mongoUri"
                        type="password"
                        autoComplete="off"
                        value={mongoUri}
                        onChange={(e) => setMongoUri(e.target.value)}
                        placeholder="mongodb+srv://..."
                        required
                    />
                    <p className="text-sm text-muted-foreground">
                        The connection string for your own MongoDB database. Your portfolio
                        content is stored here.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blobToken">Vercel Blob read-write token</Label>
                    <Input
                        id="blobToken"
                        name="blobToken"
                        type="password"
                        autoComplete="off"
                        value={blobToken}
                        onChange={(e) => setBlobToken(e.target.value)}
                        placeholder="vercel_blob_rw_..."
                        required
                    />
                    <p className="text-sm text-muted-foreground">
                        The read-write token for your own Vercel Blob store. Your images are
                        uploaded here.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">
                    For security these values are never shown after saving. Submitting this
                    form replaces both stored credentials with the values above.
                </p>

                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : storageConfigured ? "Update Credentials" : "Save Credentials"}
                </Button>
            </form>
        </div>
    )
}
