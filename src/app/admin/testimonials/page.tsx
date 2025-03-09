import { TestimonialsList } from "@/components/testimonials-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestimonialsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
                    <p className="text-muted-foreground">Manage testimonials from your clients and collaborators</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Testimonials</CardTitle>
                    <CardDescription>Review, approve, and manage testimonials for your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                    <TestimonialsList />
                </CardContent>
            </Card>
        </div>
    )
}

