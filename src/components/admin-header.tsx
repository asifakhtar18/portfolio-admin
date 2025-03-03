"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/firebase/auth"
import { toast } from "sonner"

export function AdminHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()


    const handleSignOut = async () => {
        try {
            await signOut()
            router.push("/")
            toast("Signed out successfully")
        } catch (error) {
            console.error("Sign out error:", error)
            toast("Failed to sign out")
        }
    }

    return (
        <header className="bg-white border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 flex items-center justify-between h-16">
                <Link href="/admin" className="font-bold text-xl">
                    Portfolio Admin
                </Link>

                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </Button>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Button variant="ghost" onClick={handleSignOut}>
                        Sign Out
                    </Button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b p-4">
                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                        Sign Out
                    </Button>
                </div>
            )}
        </header>
    )
}

