import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background flex flex-col">
                <AdminHeader />
                <div className="flex flex-1 flex-col md:flex-row">
                    <AdminSidebar />
                    <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8">
                        <div className="mx-auto w-full max-w-5xl">{children}</div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}

