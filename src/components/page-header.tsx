import type React from "react"

/**
 * Consistent page header for admin screens: a title, an optional one-line
 * context, and an optional actions slot aligned to the right. Left-aligned,
 * quiet, with a divider that separates the header from the content region.
 */
export function PageHeader({
    title,
    description,
    actions,
}: {
    title: string
    description?: string
    actions?: React.ReactNode
}) {
    return (
        <div className="mb-6 border-b pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                    {description ? (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
        </div>
    )
}
