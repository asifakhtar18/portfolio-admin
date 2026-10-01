import { CredentialsForm } from "@/components/credentials-form"
import { TenantDetails } from "@/components/tenant-details"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Your account details and storage credentials</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                        Your tenant identity. The Tenant ID is what your public site and the public API routes use.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TenantDetails />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Storage Credentials</CardTitle>
                    <CardDescription>
                        Connect your own MongoDB database and Vercel Blob store. Your
                        portfolio content and images are stored in your own accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CredentialsForm />
                </CardContent>
            </Card>
        </div>
    )
}
