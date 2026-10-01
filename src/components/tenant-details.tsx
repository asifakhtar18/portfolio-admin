"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

/**
 * Account details for the authenticated tenant, shown on the Settings page.
 *
 * Surfaces the tenant's identity from `/auth/me` (via the auth context): the
 * tenant id, username, email, and whether storage is configured. The tenant id
 * is the value a tenant pastes into their public site's
 * `NEXT_PUBLIC_OPERATOR_TENANT_ID`, so it is shown prominently with a copy
 * button.
 */
export function TenantDetails() {
    const { tenant, loading } = useAuth()
    const [copied, setCopied] = useState(false)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Spinner />
            </div>
        )
    }

    if (!tenant) {
        return (
            <p className="text-sm text-muted-foreground">
                Unable to load your account details. Try signing in again.
            </p>
        )
    }

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(tenant.id)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // Clipboard may be unavailable (e.g. insecure context); ignore.
        }
    }

    return (
        <div className="space-y-5">
            {/* Tenant id — the value used for the public site. */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Tenant ID</label>
                    <Button variant="outline" size="sm" onClick={copyId}>
                        {copied ? (
                            <>
                                <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                            </>
                        )}
                    </Button>
                </div>
                <code className="block w-full overflow-x-auto rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                    {tenant.id}
                </code>
                <p className="text-xs text-muted-foreground">
                    This is your public portfolio id. Set it as{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono">
                        NEXT_PUBLIC_OPERATOR_TENANT_ID
                    </code>{" "}
                    in your public site, and it&apos;s the{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono">:tenantId</code> in the public API routes.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Username</label>
                    <p className="text-sm text-muted-foreground">{tenant.username}</p>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground break-all">{tenant.email}</p>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Storage</label>
                <div>
                    {tenant.storageConfigured ? (
                        <Badge variant="secondary">Configured</Badge>
                    ) : (
                        <Badge variant="outline">Not configured</Badge>
                    )}
                </div>
                {!tenant.storageConfigured ? (
                    <p className="text-xs text-muted-foreground">
                        Add your storage credentials below before managing portfolio content.
                    </p>
                ) : null}
            </div>
        </div>
    )
}
