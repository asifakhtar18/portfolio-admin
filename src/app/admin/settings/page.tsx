import { CredentialsForm } from "@/components/credentials-form"
import { TenantDetails } from "@/components/tenant-details"
import { PageHeader } from "@/components/page-header"
import { PageTransition, Stagger, FadeItem } from "@/components/ui/motion"

export default function SettingsPage() {
    return (
        <PageTransition>
            <PageHeader
                title="Settings"
                description="Your account and the storage that holds your portfolio content."
            />
            <Stagger className="max-w-2xl space-y-5">
                <FadeItem className="rounded-lg border bg-card">
                    <div className="border-b px-5 py-3.5">
                        <h2 className="text-sm font-semibold">Account</h2>
                        <p className="text-sm text-muted-foreground">
                            Your identity. The Portfolio ID is what your public site and the public API use.
                        </p>
                    </div>
                    <div className="p-5">
                        <TenantDetails />
                    </div>
                </FadeItem>

                <FadeItem className="rounded-lg border bg-card">
                    <div className="border-b px-5 py-3.5">
                        <h2 className="text-sm font-semibold">Storage</h2>
                        <p className="text-sm text-muted-foreground">
                            Connect your own MongoDB and Vercel Blob. Your content and images stay in your accounts.
                        </p>
                    </div>
                    <div className="p-5">
                        <CredentialsForm />
                    </div>
                </FadeItem>
            </Stagger>
        </PageTransition>
    )
}
