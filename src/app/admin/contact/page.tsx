import { ContactForm } from "@/components/contact-form"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"

export default function ContactPage() {
    return (
        <PageTransition>
            <PageHeader
                title="Contact"
                description="How visitors reach you, plus the social links shown on your portfolio."
            />
            <div className="max-w-2xl rounded-lg border bg-card p-5 sm:p-6">
                <ContactForm />
            </div>
        </PageTransition>
    )
}
