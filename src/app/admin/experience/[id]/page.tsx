import { ExperienceForm } from "@/components/experience-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditExperiencePage({ params }: { params: { id: string } }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Experience</h1>
                <p className="text-muted-foreground">Update your work experience details</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Experience Details</CardTitle>
                    <CardDescription>Edit the details for your work experience</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExperienceForm experienceId={params.id} />
                </CardContent>
            </Card>
        </div>
    )
}

