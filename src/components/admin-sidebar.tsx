"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, User, Briefcase, Code, Phone, FileText, Eye } from "lucide-react"

const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/about", label: "About", icon: User },
    { href: "/admin/skills", label: "Skills", icon: Code },
    { href: "/admin/projects", label: "Projects", icon: FileText },
    { href: "/admin/experience", label: "Experience", icon: Briefcase },
    { href: "/admin/contact", label: "Contact", icon: Phone },
    { href: "/admin/preview", label: "Preview", icon: Eye },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-full md:w-64 bg-white border-r md:h-[calc(100vh-4rem)] md:sticky md:top-16">
            <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}

