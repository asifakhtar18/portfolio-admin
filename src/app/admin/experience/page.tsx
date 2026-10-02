import { ExperienceList } from "@/components/experience-list"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ExperiencePage() {
    return (
        <PageTransition>
            <PageHeader
                title="Experience"
                description="Your work history, newest first."
                actions={
                    <Link href="/admin/experience/new">
                        <Button>
                            <Plus className="h-4 w-4" />
                            New role
                        </Button>
                    </Link>
                }
            />
            <ExperienceList />
        </PageTransition>
    )
}
