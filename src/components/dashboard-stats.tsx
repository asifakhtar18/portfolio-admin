"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getStats } from "@/lib/api/stats"
import type { StatsResponse } from "@/lib/api/types"

type Stat = { label: string; value: number; href: string }

/**
 * Content counts for the Overview, rendered as large tabular numerals (this is
 * a data tool, so mono numerals are information, not decoration). Each stat
 * links to the section it summarizes. Loading uses a skeleton rather than
 * spinners-in-cards so the layout does not jump.
 */
export function DashboardStats() {
    const [stats, setStats] = useState<StatsResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getStats()
                setStats(data)
            } catch (error) {
                console.error("Error fetching stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const items: Stat[] = [
        { label: "Projects", value: stats?.projects ?? 0, href: "/admin/projects" },
        { label: "Skills", value: stats?.skills ?? 0, href: "/admin/skills" },
        { label: "Experience", value: stats?.experiences ?? 0, href: "/admin/experience" },
    ]

    return (
        <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3">
            {items.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className="group bg-card p-5 transition-colors hover:bg-muted/50"
                >
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {loading ? (
                        <div className="mt-2 h-9 w-12 animate-pulse rounded bg-muted" />
                    ) : (
                        <p className="tabular mt-1 text-3xl font-semibold text-foreground">{item.value}</p>
                    )}
                </Link>
            ))}
        </div>
    )
}
