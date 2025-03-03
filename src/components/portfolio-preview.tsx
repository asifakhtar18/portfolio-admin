"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Spinner } from "@/components/ui/spinner"
import { getAboutData, getSkills, getProjects, getExperiences, getContactData } from "@/lib/firebase/firestore"

type PortfolioData = {
    about: {
        bio: string
        designation: string
    }
    skills: string[]
    projects: {
        id: string
        name: string
        description: string
        imageUrl: string
        link?: string
    }[]
    experiences: {
        id: string
        title: string
        company: string
        startDate: string
        endDate: string
        description: string
    }[]
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
                const [about, skills, projects, experiences, contact] = await Promise.all([
                    getAboutData(),
                    getSkills(),
                    getProjects(),
                    getExperiences(),
                    getContactData(),
                ])

                setData({
                    about: (about as PortfolioData['about']) || { bio: "", designation: "" },
                    skills: (skills as string[]) || [],
                    projects: (projects as PortfolioData['projects']) || [],
                    experiences: (experiences as PortfolioData['experiences']) || [],
                    contact: (contact as PortfolioData['contact']) || { email: "", phone: "", socialMedia: [] },
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
            <section className="mb-12 text-center">
                <h1 className="text-3xl font-bold mb-2">{data.about.designation || "Your Name"}</h1>
                <p className="text-muted-foreground">{data.about.bio || "Your bio will appear here"}</p>
            </section>

            {/* Skills Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-center">Skills</h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {data.skills.length > 0 ? (
                        data.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                                {skill}
                            </span>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No skills added yet</p>
                    )}
                </div>
            </section>

            {/* Projects Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-center">Projects</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {data.projects.length > 0 ? (
                        data.projects.map((project) => (
                            <div key={project.id} className="border rounded-lg overflow-hidden">
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={project.imageUrl || "/placeholder.svg?height=200&width=400"}
                                        alt={project.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg">{project.name}</h3>
                                    <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center col-span-2">No projects added yet</p>
                    )}
                </div>
            </section>

            {/* Experience Section */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-center">Experience</h2>
                <div className="space-y-4">
                    {data.experiences.length > 0 ? (
                        data.experiences.map((experience) => (
                            <div key={experience.id} className="border rounded-lg p-4">
                                <h3 className="font-semibold text-lg">{experience.title}</h3>
                                <p className="text-muted-foreground">{experience.company}</p>
                                <p className="text-sm text-muted-foreground">
                                    {experience.startDate} - {experience.endDate || "Present"}
                                </p>
                                <p className="mt-2 text-sm">{experience.description}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center">No experience entries added yet</p>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-center">Contact</h2>
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

