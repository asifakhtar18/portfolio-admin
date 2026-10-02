"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
    Github,
    Linkedin,
    Twitter,
    Instagram,
    Youtube,
    Mail,
    Globe,
    Star,
    ExternalLink,
    Building2,
    type LucideIcon,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Stagger, FadeItem } from "@/components/ui/motion"
import { useAuth } from "@/lib/auth-context"
import { getAbout } from "@/lib/api/about"
import { getSkills } from "@/lib/api/skills"
import { getProjects } from "@/lib/api/projects"
import { getExperiences } from "@/lib/api/experiences"
import { getContactInfo } from "@/lib/api/contact"
import { getTestimonials } from "@/lib/api/testimonials"
import type {
    ProjectResponse,
    ExperienceResponse,
    TestimonialResponse,
} from "@/lib/api/types"

type PortfolioData = {
    about: { bio: string; designation: string; profileImage?: string }
    skills: string[]
    projects: ProjectResponse[]
    experiences: ExperienceResponse[]
    testimonials: TestimonialResponse[]
    contact: { email: string; phone: string; socialMedia: { platform: string; url: string }[] }
}

/** Map a social platform name to an icon; falls back to a globe. */
function socialIcon(platform: string): LucideIcon {
    const key = platform.toLowerCase()
    if (key.includes("git")) return Github
    if (key.includes("linkedin")) return Linkedin
    if (key.includes("twitter") || key === "x") return Twitter
    if (key.includes("instagram")) return Instagram
    if (key.includes("youtube")) return Youtube
    if (key.includes("mail") || key.includes("email")) return Mail
    return Globe
}

/** Section heading with a short underline accent — quiet, consistent rhythm. */
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{children}</h2>
            <span className="mx-auto mt-2 block h-0.5 w-10 rounded-full bg-primary" />
        </div>
    )
}

export function PortfolioPreview() {
    const { tenant } = useAuth()
    const [data, setData] = useState<PortfolioData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [about, skills, projects, experiences, testimonials, contact] = await Promise.all([
                    getAbout(),
                    getSkills(),
                    getProjects(),
                    getExperiences(),
                    getTestimonials(),
                    getContactInfo(),
                ])
                setData({
                    about: about
                        ? { bio: about.bio, designation: about.designation, profileImage: about.profileImage }
                        : { bio: "", designation: "" },
                    skills: skills?.items ?? [],
                    projects: projects || [],
                    experiences: experiences || [],
                    // Only approved testimonials are shown publicly.
                    testimonials: (testimonials || []).filter((t) => t.isApproved),
                    contact: contact
                        ? { email: contact.email, phone: contact.phone, socialMedia: contact.socialMedia ?? [] }
                        : { email: "", phone: "", socialMedia: [] },
                })
            } catch (error) {
                console.error("Error fetching portfolio data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-24">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="rounded-lg border border-dashed py-16 text-center">
                <p className="text-sm text-muted-foreground">Could not load your portfolio data.</p>
            </div>
        )
    }

    const hasAnyContent =
        data.about.bio ||
        data.about.designation ||
        data.skills.length ||
        data.projects.length ||
        data.experiences.length ||
        data.testimonials.length ||
        data.contact.email

    const previewHost = tenant?.username ? `${tenant.username}.folyo.site` : "your-portfolio.folyo.site"

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* Browser chrome so it reads as a live site preview. */}
            <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
                <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </span>
                <div className="mx-auto flex max-w-sm flex-1 items-center justify-center">
                    <span className="tabular truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                        {previewHost}
                    </span>
                </div>
            </div>

            {/* The rendered portfolio, on its own light canvas. */}
            <div className="bg-white text-neutral-800">
                {!hasAnyContent ? (
                    <div className="px-6 py-24 text-center">
                        <h2 className="text-lg font-semibold text-neutral-900">Your portfolio is empty</h2>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                            Add your About, projects, and skills to see them come together here.
                        </p>
                    </div>
                ) : (
                    <Stagger className="mx-auto max-w-4xl px-6 py-14 sm:py-20" gap={0.08}>
                        {/* Hero */}
                        <FadeItem as="section" className="mb-20 flex flex-col items-center text-center">
                            {data.about.profileImage ? (
                                <div className="relative mb-6 h-28 w-28 overflow-hidden rounded-full ring-4 ring-primary/15">
                                    <Image
                                        src={data.about.profileImage}
                                        alt={data.about.designation || "Profile"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary ring-4 ring-primary/15">
                                    {(tenant?.username ?? "F").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                                {data.about.designation || "Your title"}
                            </h1>
                            {data.about.bio ? (
                                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600">{data.about.bio}</p>
                            ) : (
                                <p className="mt-4 max-w-2xl text-lg text-neutral-400">Your bio will appear here.</p>
                            )}

                            {data.contact.socialMedia.length > 0 ? (
                                <div className="mt-6 flex items-center gap-2">
                                    {data.contact.socialMedia.map((s, i) => {
                                        const Icon = socialIcon(s.platform)
                                        return (
                                            <a
                                                key={i}
                                                href={s.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={s.platform}
                                                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:border-primary hover:text-primary"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </a>
                                        )
                                    })}
                                </div>
                            ) : null}
                        </FadeItem>

                        {/* Skills */}
                        {data.skills.length > 0 ? (
                            <FadeItem as="section" className="mb-20">
                                <SectionTitle>Skills</SectionTitle>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {data.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-sm text-neutral-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </FadeItem>
                        ) : null}

                        {/* Projects */}
                        {data.projects.length > 0 ? (
                            <FadeItem as="section" className="mb-20">
                                <SectionTitle>Projects</SectionTitle>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {data.projects.map((project) => {
                                        const mainImage =
                                            project.images?.find((img) => img.isMain) || project.images?.[0]
                                        return (
                                            <div
                                                key={project.id}
                                                className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
                                            >
                                                <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                                                    {mainImage?.url ? (
                                                        <Image
                                                            src={mainImage.url}
                                                            alt={project.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-neutral-300">
                                                            <Globe className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                    {project.featured ? (
                                                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-primary shadow-sm backdrop-blur">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            Featured
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="p-5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-semibold text-neutral-900">{project.name}</h3>
                                                        {project.link ? (
                                                            <a
                                                                href={project.link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-neutral-400 transition-colors hover:text-primary"
                                                                title="View project"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                    {project.description ? (
                                                        <p className="mt-1.5 line-clamp-3 text-sm text-neutral-600">
                                                            {project.description}
                                                        </p>
                                                    ) : null}
                                                    {project.technologies?.length ? (
                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {project.technologies.map((t) => (
                                                                <span
                                                                    key={t}
                                                                    className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                                                                >
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </FadeItem>
                        ) : null}

                        {/* Experience — timeline */}
                        {data.experiences.length > 0 ? (
                            <FadeItem as="section" className="mb-20">
                                <SectionTitle>Experience</SectionTitle>
                                <ol className="relative mx-auto max-w-2xl space-y-8 border-l border-neutral-200 pl-6">
                                    {data.experiences.map((exp) => (
                                        <li key={exp.id} className="relative">
                                            <span className="absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-white">
                                                <Building2 className="h-3 w-3 text-primary" />
                                            </span>
                                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                                <h3 className="font-semibold text-neutral-900">{exp.title}</h3>
                                                <span className="tabular text-xs text-neutral-500">
                                                    {exp.startDate} — {exp.endDate || "Present"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-neutral-600">{exp.company}</p>
                                            {exp.description ? (
                                                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                                                    {exp.description}
                                                </p>
                                            ) : null}
                                            {exp.technologies?.length ? (
                                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                                    {exp.technologies.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </li>
                                    ))}
                                </ol>
                            </FadeItem>
                        ) : null}

                        {/* Testimonials */}
                        {data.testimonials.length > 0 ? (
                            <FadeItem as="section" className="mb-20">
                                <SectionTitle>Testimonials</SectionTitle>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {data.testimonials.map((t) => (
                                        <figure
                                            key={t.id}
                                            className="flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/60 p-6"
                                        >
                                            {typeof t.rating === "number" && t.rating > 0 ? (
                                                <div className="mb-3 flex">
                                                    {Array.from({ length: 5 }).map((_, s) => (
                                                        <Star
                                                            key={s}
                                                            className={
                                                                "h-4 w-4 " +
                                                                (s < (t.rating ?? 0)
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-neutral-300")
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            ) : null}
                                            <blockquote className="flex-1 text-[15px] leading-relaxed text-neutral-700">
                                                &ldquo;{t.message}&rdquo;
                                            </blockquote>
                                            <figcaption className="mt-4 flex items-center gap-3">
                                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                                                    {t.avatar ? (
                                                        <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-medium text-primary">
                                                            {t.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-900">{t.name}</p>
                                                    <p className="text-xs text-neutral-500">
                                                        {t.role}
                                                        {t.company ? ` · ${t.company}` : ""}
                                                    </p>
                                                </div>
                                            </figcaption>
                                        </figure>
                                    ))}
                                </div>
                            </FadeItem>
                        ) : null}

                        {/* Contact */}
                        {data.contact.email || data.contact.phone ? (
                            <FadeItem as="section">
                                <SectionTitle>Get in touch</SectionTitle>
                                <div className="flex flex-col items-center gap-3">
                                    {data.contact.email ? (
                                        <a
                                            href={`mailto:${data.contact.email}`}
                                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {data.contact.email}
                                        </a>
                                    ) : null}
                                    {data.contact.phone ? (
                                        <p className="tabular text-sm text-neutral-500">{data.contact.phone}</p>
                                    ) : null}
                                </div>
                            </FadeItem>
                        ) : null}
                    </Stagger>
                )}
            </div>
        </div>
    )
}
