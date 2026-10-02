"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { getRecentUpdates } from "@/lib/api/updates"
import type { UpdateLogResponse } from "@/lib/api/types"

/**
 * Recent activity, rendered as a vertical timeline — the content genuinely is a
 * chronological sequence, so a timeline rail (rather than identical cards)
 * encodes that meaning. Reuses the existing `/updates` API call unchanged.
 */
export function RecentUpdates() {
    const [updates, setUpdates] = useState<UpdateLogResponse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const data = await getRecentUpdates()
                setUpdates(data)
            } catch (error) {
                console.error("Error fetching updates:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUpdates()
    }, [])

    return (
        <section className="rounded-lg border bg-card">
            <div className="border-b px-5 py-3.5">
                <h2 className="text-sm font-semibold">Recent activity</h2>
            </div>
            <div className="p-5">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-muted" />
                                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                ) : updates.length === 0 ? (
                    <p className="py-2 text-sm text-muted-foreground">
                        No activity yet. Changes you make will show up here.
                    </p>
                ) : (
                    <ol className="relative space-y-5 before:absolute before:left-[3px] before:top-1 before:h-full before:w-px before:bg-border">
                        {updates.map((update) => (
                            <li key={update.id} className="relative flex items-start gap-3 pl-0">
                                <span className="relative z-10 mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />
                                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{update.title}</p>
                                        <p className="text-xs text-muted-foreground">{update.section}</p>
                                    </div>
                                    <span className="tabular shrink-0 text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(update.updatedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    )
}
