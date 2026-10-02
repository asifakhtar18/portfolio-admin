import { ProjectsList } from "@/components/projects-list"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
    return (
        <PageTransition>
            <PageHeader
                title="Projects"
                description="The work shown on your portfolio, newest first."
                actions={
                    <Link href="/admin/projects/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New project
                        </Button>
                    </Link>
                }
            />
            <ProjectsList />
        </PageTransition>
    )
}
