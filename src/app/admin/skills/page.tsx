import { SkillsForm } from "@/components/skills-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SkillsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
                <p className="text-muted-foreground">Manage your technical skills and competencies</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Skills Management</CardTitle>
                    <CardDescription>Add, edit, or remove skills from your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                    <SkillsForm />
                </CardContent>
            </Card>
        </div>
    )
}

