import { TestimonialsList } from "@/components/testimonials-list"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"

export default function TestimonialsPage() {
    return (
        <PageTransition>
            <PageHeader
                title="Testimonials"
                description="Review and approve what others say about you. Approved ones appear on your portfolio."
            />
            <TestimonialsList />
        </PageTransition>
    )
}
