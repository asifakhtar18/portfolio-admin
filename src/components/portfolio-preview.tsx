"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Spinner } from "@/components/ui/spinner"
import {
    getAboutData,
    getSkills,
    getProjects,
    getExperiences,
    getContactData,
    getTestimonials,
} from "@/lib/firebase/firestore"
import type { Skill, Project, Experience, Testimonial } from "@/lib/types"

type PortfolioData = {
    about: {
        bio: string
        designation: string
        profileImage?: string
    }
    skills: Skill[]
    projects: Project[]
    experiences: Experience[]
    testimonials: Testimonial[]
    contact: {
        email: string
        phone: string
        socialMedia: {
            platform: string
            url: string
        }[]
    }
}

export function PortfolioPreview() {
    const [data, setData] = useState<PortfolioData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [about, skillsArray, projects, experiences, testimonials, contact] = await Promise.all([
                    getAboutData(),
                    getSkills(),
                    getProjects(),
                    getExperiences(),
                    getTestimonials(true), // Get only approved testimonials
                    getContactData(),
                ])

                setData({
                    about: (about as { bio: string; designation: string; profileImage?: string }) || { bio: "", designation: "" },
                    skills: skillsArray || [],
                    projects: projects || [],
                    experiences: (experiences as Experience[]) || [],
                    testimonials: testimonials || [],
                    contact: (contact as { email: string; phone: string; socialMedia: { platform: string; url: string; }[] }) ||
                        { email: "", phone: "", socialMedia: [] },
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
            <div className="flex justify-center p-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="text-center p-16">
                <p>Failed to load portfolio data</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* About Section */}
            <section className="mb-16 text-center">
                {data.about.profileImage && (
                    <div className="mb-6 flex justify-center">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20">
                            <Image
                                src={data.about.profileImage || "/placeholder.svg"}
                                alt={data.about.designation || "Profile"}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}
                <h1 className="text-4xl font-bold mb-2">{data.about.designation || "Your Name"}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {data.about.bio || "Your bio will appear here"}
                </p>
            </section>

            {/* Skills Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Skills</h2>

                {data.skills.length > 0 ? (
                    <div className="space-y-6">
                        {/* Group skills by category */}
                        {data.skills.map((skill, index) => (
                            <div key={index} className="space-y-2">
                                <p>{skill.name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center">No skills added yet</p>
                )}
            </section>

            {/* Projects Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Projects</h2>

                {data.projects.length > 0 ? (
                    <div className="space-y-8">
                        {data.projects.map((project) => {
                            // Find main image
                            const mainImage = project.images?.find((img) => img.isMain) || project.images?.[0]
                            // Get skills used in this project
                            const projectSkills = data.skills.filter((skill) => project.technologies?.includes(skill.id))

                            return (
                                <div key={project.id} className="border rounded-lg overflow-hidden shadow-sm">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="relative h-64">
                                            <Image
                                                src={mainImage?.url || "/placeholder.svg?height=200&width=400"}
                                                alt={project.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold">{project.name}</h3>
                                            <p className="text-muted-foreground mt-2">{project.description}</p>

                                            {projectSkills.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium mb-2">Technologies</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {projectSkills.map((skill) => (
                                                            <span key={skill.id} className="px-2 py-1 text-xs rounded-full bg-muted">
                                                                {skill.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {project.link && (
                                                <div className="mt-4">
                                                    <a
                                                        href={project.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline font-medium text-sm"
                                                    >
                                                        View Project →
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center">No projects added yet</p>
                )}
            </section>

            {/* Experience Section */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Experience</h2>

                {data.experiences.length > 0 ? (
                    <div className="space-y-6">
                        {data.experiences.map((experience) => {
                            // Get skills used in this experience
                            const experienceSkills = data.skills.filter((skill) => experience.technologies?.includes(skill.id))

                            return (
                                <div key={experience.id} className="border rounded-lg p-6 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold">{experience.title}</h3>
                                            <p className="text-lg text-muted-foreground">{experience.company}</p>
                                        </div>
                                        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                            {experience.startDate} - {experience.endDate || "Present"}
                                        </div>
                                    </div>

                                    <p className="my-4">{experience.description}</p>

                                    {experienceSkills.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Technologies Used</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {experienceSkills.map((skill) => (
                                                    <span key={skill.id} className="px-2 py-1 text-xs rounded-full bg-muted">
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center">No experience entries added yet</p>
                )}
            </section>

            {/* Testimonials Section */}
            {data.testimonials.length > 0 && (
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">Testimonials</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        {data.testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-muted/30 rounded-lg p-6 border shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative size-12 shrink-0 rounded-full overflow-hidden bg-muted">
                                        {testimonial.avatar ? (
                                            <Image
                                                src={testimonial.avatar || "/placeholder.svg"}
                                                alt={testimonial.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium text-lg">
                                                {testimonial.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-medium">{testimonial.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {testimonial.position}
                                            {testimonial.company ? ` at ${testimonial.company}` : ""}
                                        </p>
                                    </div>
                                </div>

                                <blockquote className="italic text-muted-foreground mb-4">"{testimonial.message}"</blockquote>

                                <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className={`text-lg ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}>
                                            ★
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Contact Section */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-center">Contact</h2>
                <div className="text-center">
                    {data.contact.email && (
                        <p className="mb-2">
                            <span className="font-medium">Email:</span> {data.contact.email}
                        </p>
                    )}
                    {data.contact.phone && (
                        <p className="mb-2">
                            <span className="font-medium">Phone:</span> {data.contact.phone}
                        </p>
                    )}
                    {data.contact.socialMedia.length > 0 && (
                        <div className="mt-4">
                            <p className="font-medium mb-2">Social Media:</p>
                            <div className="flex justify-center gap-4">
                                {data.contact.socialMedia.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {social.platform}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

