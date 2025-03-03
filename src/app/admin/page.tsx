import { DashboardStats } from "@/components/dashboard-stats"
import { RecentUpdates } from "@/components/recent-updates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Link href="/admin/preview">
                    <Button>Preview Portfolio</Button>
                </Link>
            </div>
            <DashboardStats />
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used actions to manage your portfolio</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link href="/admin/about">
                            <Button variant="outline" className="w-full justify-start">
                                Update About Section
                            </Button>
                        </Link>
                        <Link href="/admin/projects">
                            <Button variant="outline" className="w-full justify-start">
                                Manage Projects
                            </Button>
                        </Link>
                        <Link href="/admin/skills">
                            <Button variant="outline" className="w-full justify-start">
                                Update Skills
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <RecentUpdates />
            </div>
        </div>
    )
}

