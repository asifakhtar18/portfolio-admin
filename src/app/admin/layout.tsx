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
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <AdminHeader />
                <div className="flex flex-1 flex-col md:flex-row">
                    <AdminSidebar />
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    )
}

