import { ProjectForm } from "@/components/project-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditProjectPage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
                <p className="text-muted-foreground">Update your project details</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Edit the details for your project</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectForm projectId={params.id} />
                </CardContent>
            </Card>
        </div>
    )
}

