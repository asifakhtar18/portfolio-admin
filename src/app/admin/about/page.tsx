import { AboutForm } from "@/components/about-form"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"

export default function AboutPage() {
    return (
        <PageTransition>
            <PageHeader
                title="About"
                description="Your bio, title, and profile photo — the introduction on your portfolio."
            />
            <div className="max-w-2xl rounded-lg border bg-card p-5 sm:p-6">
                <AboutForm />
            </div>
        </PageTransition>
    )
}
