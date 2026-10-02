"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Home,
    User,
    Briefcase,
    Code,
    Phone,
    FileText,
    Eye,
    MessageSquare,
    MessageCircle,
    Settings,
    BookOpen,
    type LucideIcon,
} from "lucide-react"

type NavItem = { href: string; label: string; icon: LucideIcon }
type NavGroup = { label: string; items: NavItem[] }

/**
 * Sidebar navigation, grouped by purpose: the portfolio content a tenant edits,
 * then workspace tools. Grouping encodes meaning (content vs. tooling) rather
 * than listing everything flat. Add new sections to the appropriate group.
 */
const navGroups: NavGroup[] = [
    {
        label: "Overview",
        items: [{ href: "/admin", label: "Overview", icon: Home }],
    },
    {
        label: "Content",
        items: [
            { href: "/admin/about", label: "About", icon: User },
            { href: "/admin/projects", label: "Projects", icon: FileText },
            { href: "/admin/skills", label: "Skills", icon: Code },
            { href: "/admin/experience", label: "Experience", icon: Briefcase },
            { href: "/admin/contact", label: "Contact", icon: Phone },
            { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
            { href: "/admin/messages", label: "Messages", icon: MessageCircle },
        ],
    },
    {
        label: "Workspace",
        items: [
            { href: "/admin/preview", label: "Preview", icon: Eye },
            { href: "/admin/api-docs", label: "API Docs", icon: BookOpen },
            { href: "/admin/settings", label: "Settings", icon: Settings },
        ],
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-full shrink-0 border-b bg-background md:w-60 md:border-b-0 md:border-r">
            <nav className="flex flex-col gap-5 p-3 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:overflow-y-auto md:p-4">
                {navGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.label}</p>
                        {group.items.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/admin" && pathname?.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                                        isActive
                                            ? "bg-primary/10 font-medium text-primary"
                                            : "text-foreground/80 hover:bg-muted hover:text-foreground",
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    )
}
