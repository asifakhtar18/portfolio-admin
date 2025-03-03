import { AboutForm } from "@/components/about-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">About Section</h1>
                <p className="text-muted-foreground">Update your personal information and bio</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your bio, designation, and personal details</CardDescription>
                </CardHeader>
                <CardContent>
                    <AboutForm />
                </CardContent>
            </Card>
        </div>
    )
}

