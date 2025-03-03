import { ExperienceList } from "@/components/experience-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ExperiencePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
                    <p className="text-muted-foreground">Manage your work experience</p>
                </div>
                <Link href="/admin/experience/new">
                    <Button>Add New Experience</Button>
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>View and manage your work history</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExperienceList />
                </CardContent>
            </Card>
        </div>
    )
}

