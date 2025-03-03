import { ProjectsList } from "@/components/projects-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your portfolio projects</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button>Add New Project</Button>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>View and manage all your portfolio projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectsList />
                </CardContent>
            </Card>
        </div>
    )
}

