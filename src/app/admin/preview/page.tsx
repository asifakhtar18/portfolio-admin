import { PortfolioPreview } from "@/components/portfolio-preview"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/ui/motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PreviewPage() {
    return (
        <PageTransition>
            <PageHeader
                title="Preview"
                description="How your portfolio looks to visitors. Changes you save are live immediately."
                actions={
                    <Link href="/admin">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                }
            />
            <PortfolioPreview />
        </PageTransition>
    )
}
