import { ProjectForm } from "@/components/project-form"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
    return (
        <div>
            <PageHeader
                title="New project"
                description="Add a project to your portfolio. You can upload images after saving the details."
                actions={
                    <Link href="/admin/projects">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                }
            />
            <div className="max-w-2xl rounded-lg border bg-card p-5 sm:p-6">
                <ProjectForm />
            </div>
        </div>
    )
}
