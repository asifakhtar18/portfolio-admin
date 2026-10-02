"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

/**
 * Slim top bar for the Folyo admin.
 *
 * Carries the wordmark, a storage-status indicator (structure that encodes
 * state, not decoration), and the signed-in tenant + sign out. The sidebar
 * owns section navigation; this bar stays quiet.
 */
export function AdminHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()
    const { tenant, storageConfigured, logout } = useAuth()

    const handleSignOut = () => {
        try {
            logout()
            router.push("/")
            toast("Signed out")
        } catch (error) {
            console.error("Sign out error:", error)
            toast("Could not sign out. Try again.")
        }
    }

    return (
        <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
            <div className="flex h-14 items-center gap-4 px-4 md:px-8">
                <Link href="/admin" className="text-lg font-semibold tracking-tight">
                    Folyo
                </Link>

                {/* Storage status: a quiet, meaningful indicator. */}
                <Link
                    href="/admin/settings"
                    className="hidden items-center gap-2 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted sm:inline-flex"
                    title={storageConfigured ? "Storage connected" : "Storage not configured"}
                >
                    <span
                        className={
                            "h-1.5 w-1.5 rounded-full " +
                            (storageConfigured ? "bg-[hsl(var(--positive))]" : "bg-muted-foreground/50")
                        }
                    />
                    {storageConfigured ? "Storage connected" : "Connect storage"}
                </Link>

                <div className="ml-auto hidden items-center gap-3 md:flex">
                    {tenant ? (
                        <span className="text-sm text-muted-foreground">{tenant.username}</span>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </Button>
                </div>

                <div className="ml-auto md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="border-t p-3 md:hidden">
                    <div className="flex items-center justify-between px-1 pb-2 text-sm text-muted-foreground">
                        <span>{tenant?.username}</span>
                        <span className="inline-flex items-center gap-2">
                            <span
                                className={
                                    "h-1.5 w-1.5 rounded-full " +
                                    (storageConfigured ? "bg-[hsl(var(--positive))]" : "bg-muted-foreground/50")
                                }
                            />
                            {storageConfigured ? "Storage connected" : "Connect storage"}
                        </span>
                    </div>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </Button>
                </div>
            )}
        </header>
    )
}
