import { ProjectForm } from "@/components/project-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewProjectPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Project</h1>
                <p className="text-muted-foreground">Create a new project for your portfolio</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Fill in the details for your new project</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectForm />
                </CardContent>
            </Card>
        </div>
    )
}

