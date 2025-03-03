import { ExperienceForm } from "@/components/experience-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewExperiencePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add New Experience</h1>
                <p className="text-muted-foreground">Add a new work experience entry</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Experience Details</CardTitle>
                    <CardDescription>Fill in the details for your new work experience</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExperienceForm />
                </CardContent>
            </Card>
        </div>
    )
}

