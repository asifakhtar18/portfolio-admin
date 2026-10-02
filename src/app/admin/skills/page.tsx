import { SkillsForm } from "@/components/skills-form"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"

export default function SkillsPage() {
    return (
        <PageTransition>
            <PageHeader
                title="Skills"
                description="The technologies and competencies shown on your portfolio."
            />
            <div className="max-w-2xl rounded-lg border bg-card p-5 sm:p-6">
                <SkillsForm />
            </div>
        </PageTransition>
    )
}
