"use client"

import Link from "next/link"
import { ArrowRight, Database } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

/**
 * Overview hero.
 *
 * The one place the Overview spends emphasis. When the tenant has not connected
 * storage yet, this is a direct, actionable setup prompt — an empty/not-ready
 * screen treated as an invitation to act, in the product's voice. Once storage
 * is connected it steps back to a quiet greeting so the stats and activity
 * below become the focus.
 */
export function DashboardWelcome() {
    const { tenant, storageConfigured, loading } = useAuth()

    if (loading) {
        return <div className="h-24 animate-pulse rounded-lg border bg-muted/40" />
    }

    const name = tenant?.username

    if (!storageConfigured) {
        return (
            <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-5">
                <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Database className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">Connect your storage to start</h2>
                            <p className="text-sm text-muted-foreground">
                                Folyo keeps your portfolio in your own database and image store. Add your
                                MongoDB connection and Vercel Blob token, and your content lives in your
                                accounts — not ours.
                            </p>
                        </div>
                        <Link href="/admin/settings">
                            <Button>
                                Connect storage
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-5">
            <div className="space-y-1">
                <h2 className="text-base font-semibold">
                    {name ? `Welcome back, ${name}` : "Welcome back"}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Your storage is connected. Edit any section from the left, or preview the live result.
                </p>
            </div>
            {tenant?.id ? (
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Portfolio ID</p>
                    <p className="tabular text-sm">{tenant.id}</p>
                </div>
            ) : null}
        </div>
    )
}
