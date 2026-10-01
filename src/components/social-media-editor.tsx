"use client"

import { ArrowDown, ArrowUp, Github, Globe, Instagram, Linkedin, Mail, Plus, Twitter, X, Youtube, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

/** A single social media link, as stored on the contact record. */
export type SocialLink = {
    platform: string
    url: string
}

/** A known platform preset: its label, icon, and a hint URL. */
type Preset = {
    value: string
    label: string
    icon: LucideIcon
    placeholder: string
}

/**
 * Known platform presets shown in the dropdown. "Other" lets a tenant enter a
 * custom platform name. Order here is the order shown in the dropdown.
 */
const PRESETS: Preset[] = [
    { value: "GitHub", label: "GitHub", icon: Github, placeholder: "https://github.com/username" },
    { value: "LinkedIn", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
    { value: "Twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://x.com/username" },
    { value: "Instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
    { value: "YouTube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
    { value: "Email", label: "Email", icon: Mail, placeholder: "mailto:you@example.com" },
    { value: "Other", label: "Other", icon: Globe, placeholder: "https://..." },
]

const OTHER = "Other"

/** The icon for a platform, falling back to a globe for custom/unknown names. */
function iconForPlatform(platform: string): LucideIcon {
    return PRESETS.find((p) => p.value.toLowerCase() === platform.toLowerCase())?.icon ?? Globe
}

/** The placeholder URL hint for a platform. */
function placeholderForPlatform(platform: string): string {
    return PRESETS.find((p) => p.value.toLowerCase() === platform.toLowerCase())?.placeholder ?? "https://..."
}

/** Whether a platform name matches a known (non-"Other") preset. */
function isPreset(platform: string): boolean {
    return PRESETS.some((p) => p.value !== OTHER && p.value.toLowerCase() === platform.toLowerCase())
}

/**
 * Validate a social link URL. Accepts http(s) and mailto URLs. An empty string
 * is treated as "not yet filled" (no error shown) so a freshly added row isn't
 * immediately flagged. Returns an error message or `null` when valid.
 */
export function validateSocialUrl(url: string): string | null {
    const trimmed = url.trim()
    if (trimmed.length === 0) {
        return null
    }
    if (trimmed.startsWith("mailto:")) {
        return trimmed.length > "mailto:".length ? null : "Enter an email after mailto:"
    }
    try {
        const parsed = new URL(trimmed)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return "URL must start with http:// or https://"
        }
        return null
    } catch {
        return "Enter a valid URL (https://...)"
    }
}

/**
 * Editor for the tenant's social media links. Controlled: the parent owns the
 * `value` array and receives updates via `onChange`. Rendered inside the
 * Contact form so the links persist on the same contact record.
 *
 * Features: a platform preset dropdown with icons, a custom-name field when
 * "Other" is selected, inline URL validation, reordering (move up/down), and
 * add/remove.
 */
export function SocialMediaEditor({
    value,
    onChange,
}: {
    value: SocialLink[]
    onChange: (links: SocialLink[]) => void
}) {
    const update = (index: number, patch: Partial<SocialLink>) => {
        const next = value.map((link, i) => (i === index ? { ...link, ...patch } : link))
        onChange(next)
    }

    const add = () => {
        onChange([...value, { platform: "", url: "" }])
    }

    const remove = (index: number) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction
        if (target < 0 || target >= value.length) {
            return
        }
        const next = [...value]
        const [item] = next.splice(index, 1)
        next.splice(target, 0, item)
        onChange(next)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label>Social Media</Label>
                    <p className="text-sm text-muted-foreground">
                        Links shown on your public portfolio. Reorder to control display order.
                    </p>
                </div>
                <Button type="button" onClick={add} variant="outline" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Platform
                </Button>
            </div>

            {value.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No social links yet. Add a platform to get started.
                </p>
            ) : null}

            <div className="space-y-3">
                {value.map((link, index) => {
                    // A row uses "Other" mode when its platform is empty or not a known preset.
                    const selectValue = isPreset(link.platform) ? link.platform : OTHER
                    const showCustomName = selectValue === OTHER
                    const Icon = iconForPlatform(link.platform)
                    const urlError = validateSocialUrl(link.url)

                    return (
                        <div key={index} className="rounded-lg border p-3">
                            <div className="flex flex-wrap items-start gap-3">
                                {/* Platform preset */}
                                <div className="w-full space-y-1.5 sm:w-48">
                                    <Label className="text-xs">Platform</Label>
                                    <Select
                                        value={selectValue}
                                        onValueChange={(platform) => {
                                            // Selecting a preset sets the platform directly; selecting
                                            // "Other" clears it so the custom-name field drives it.
                                            update(index, { platform: platform === OTHER ? "" : platform })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRESETS.map((preset) => (
                                                <SelectItem key={preset.value} value={preset.value}>
                                                    <span className="flex items-center gap-2">
                                                        <preset.icon className="h-4 w-4" />
                                                        {preset.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Custom platform name (only in "Other" mode) */}
                                {showCustomName ? (
                                    <div className="w-full space-y-1.5 sm:w-40">
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                            value={link.platform}
                                            onChange={(e) => update(index, { platform: e.target.value })}
                                            placeholder="e.g. Dribbble"
                                        />
                                    </div>
                                ) : null}

                                {/* URL */}
                                <div className="min-w-[12rem] flex-1 space-y-1.5">
                                    <Label className="text-xs">URL</Label>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <Input
                                            value={link.url}
                                            onChange={(e) => update(index, { url: e.target.value })}
                                            placeholder={placeholderForPlatform(link.platform)}
                                            aria-invalid={urlError ? true : undefined}
                                            className={urlError ? "border-destructive" : undefined}
                                        />
                                    </div>
                                    {urlError ? (
                                        <p className="text-xs text-destructive">{urlError}</p>
                                    ) : null}
                                </div>

                                {/* Reorder + remove controls */}
                                <div className="flex items-center gap-1 pt-6">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => move(index, -1)}
                                        disabled={index === 0}
                                        aria-label="Move up"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => move(index, 1)}
                                        disabled={index === value.length - 1}
                                        aria-label="Move down"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        aria-label="Remove"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
