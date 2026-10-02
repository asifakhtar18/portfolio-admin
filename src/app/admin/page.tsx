import { DashboardStats } from "@/components/dashboard-stats"
import { RecentUpdates } from "@/components/recent-updates"
import { DashboardWelcome } from "@/components/dashboard-welcome"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
    return (
        <PageTransition>
            <PageHeader
                title="Overview"
                description="Your portfolio at a glance — content counts, recent activity, and what to do next."
                actions={
                    <Link href="/admin/preview">
                        <Button variant="outline">Preview portfolio</Button>
                    </Link>
                }
            />

            <div className="space-y-6">
                {/* Setup guidance / identity: the hero moment of this screen. */}
                <DashboardWelcome />

                {/* Content counts in tabular mono numerals. */}
                <DashboardStats />

                {/* Activity timeline. */}
                <RecentUpdates />
            </div>
        </PageTransition>
    )
}
