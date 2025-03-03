import { PortfolioPreview } from "@/components/portfolio-preview"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PreviewPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Portfolio Preview</h1>
                    <p className="text-muted-foreground">Preview how your portfolio will look to visitors</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Publish Changes</Button>
                    <Link href="/admin">
                        <Button variant="secondary">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
            <div className="border rounded-lg overflow-hidden bg-white">
                <PortfolioPreview />
            </div>
        </div>
    )
}

