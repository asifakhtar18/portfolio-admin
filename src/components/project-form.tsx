"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Plus, Upload, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getProject, createProject, updateProject } from "@/lib/firebase/firestore"
import { uploadMultipleImages } from "@/lib/firebase/storage"
import { getSkills } from "@/lib/firebase/firestore"
import type { Project, ProjectImage, Skill } from "@/lib/types"

type ProjectFormProps = {
    projectId?: string
}

export function ProjectForm({ projectId }: ProjectFormProps) {
    const [project, setProject] = useState<Partial<Project>>({
        name: "",
        description: "",
        link: "",
        images: [],
        technologies: [],
        featured: false,
    })
    const [skills, setSkills] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [mainImageIndex, setMainImageIndex] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newSkillDialogOpen, setNewSkillDialogOpen] = useState(false)
    const [newSkill, setNewSkill] = useState({ name: "", category: "Frontend" })
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                const skillsData = await getSkills()
                setSkills(skillsData)


                if (projectId) {
                    const projectData = await getProject(projectId)
                    if (projectData) {
                        setProject(projectData)

                        const mainImageIndex = projectData.images?.findIndex((img) => img.isMain) || 0
                        if (mainImageIndex >= 0) {
                            setMainImageIndex(mainImageIndex)
                        }

                        const previews = projectData.images?.map((img) => img.url) || []
                        setImagePreviews(previews)
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast("Failed to fetch data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [projectId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProject((prev) => ({ ...prev, [name]: value }))
    }

    const handleFeaturedToggle = () => {
        setProject((prev) => ({ ...prev, featured: !prev.featured }))
    }

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setImageFiles((prev) => [...prev, ...files])

            // Create preview URLs
            const newPreviews = files.map((file) => URL.createObjectURL(file))
            setImagePreviews((prev) => [...prev, ...newPreviews])

            // Set the first image as main if no main image is set
            if (mainImageIndex === null && imagePreviews.length === 0 && newPreviews.length > 0) {
                setMainImageIndex(0)
            }
        }
    }

    const removeImage = (index: number) => {
        // Remove from preview
        const newPreviews = [...imagePreviews]
        newPreviews.splice(index, 1)
        setImagePreviews(newPreviews)

        // Remove from files if it's a new file
        if (index < imageFiles.length) {
            const newFiles = [...imageFiles]
            newFiles.splice(index, 1)
            setImageFiles(newFiles)
        } else {
            // It's an existing image, mark for deletion
            const projectImages = [...(project.images || [])]
            projectImages.splice(index - imageFiles.length, 1)
            setProject((prev) => ({ ...prev, images: projectImages }))
        }

        // Update main image index if needed
        if (mainImageIndex === index) {
            setMainImageIndex(newPreviews.length > 0 ? 0 : null)
        } else if (mainImageIndex !== null && mainImageIndex > index) {
            setMainImageIndex(mainImageIndex - 1)
        }
    }

    const setMainImage = (index: number) => {
        setMainImageIndex(index)
    }

    const toggleTechnology = (skillId: string) => {
        setProject((prev) => {
            const technologies = prev.technologies || []
            return {
                ...prev,
                technologies: technologies.includes(skillId)
                    ? technologies.filter((id) => id !== skillId)
                    : [...technologies, skillId],
            }
        })
    }



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (!project.name?.trim() || !project.description?.trim()) {
                toast("Project name and description are required")
                setSaving(false)
                return
            }

            let projectImages: ProjectImage[] = [...(project.images || [])]

            if (imageFiles.length > 0) {
                const uploadedImages = await uploadMultipleImages(
                    imageFiles,
                    `projects/${project.name.replace(/\s+/g, "-").toLowerCase()}`,
                )

                const newImages: ProjectImage[] = uploadedImages.map((img) => ({
                    id: img.id,
                    url: img.url,
                    alt: project.name || "Project image",
                    isMain: false,
                }))

                projectImages = [...projectImages, ...newImages]
            }

            if (mainImageIndex !== null && projectImages.length > 0) {
                projectImages = projectImages.map((img, idx) => ({
                    ...img,
                    isMain: idx === mainImageIndex,
                }))
            }

            const projectData: Partial<Project> = {
                ...project,
                images: projectImages,
            }

            if (projectId) {
                await updateProject(projectId, projectData)
                toast("Project updated successfully")
            } else {
                await createProject(projectData as Omit<Project, "id" | "createdAt" | "updatedAt">)
                toast("Project created successfully")
                router.push("/admin/projects")
            }
        } catch (error) {
            console.error("Error saving project:", error)
            toast("Failed to save project")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Spinner size="lg" />
            </div>
        )
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={project.name}
                        onChange={handleChange}
                        placeholder="My Awesome Project"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={project.description}
                        onChange={handleChange}
                        placeholder="Describe your project..."
                        rows={4}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="link">Project Link (Optional)</Label>
                    <Input id="link" name="link" value={project.link} onChange={handleChange} placeholder="https://example.com" />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="featured" checked={project.featured} onCheckedChange={handleFeaturedToggle} />
                    <Label htmlFor="featured">Feature this project on your portfolio</Label>
                </div>
            </div>

            {/* Project Images */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Images</h3>

                <div className="space-y-2">
                    <Label htmlFor="images">Upload Images</Label>
                    <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        onChange={handleImagesChange}
                        multiple
                        className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                        You can upload multiple images. Click on an image to set it as the main image.
                    </p>
                </div>

                {imagePreviews.length > 0 && (
                    <div>
                        <Label>Project Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className={`relative group border rounded-md overflow-hidden ${mainImageIndex === index ? "ring-2 ring-primary" : ""
                                        }`}
                                >
                                    <div className="relative h-40 w-full">
                                        <Image
                                            src={preview || "/placeholder.svg"}
                                            alt={`Project image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="size-8"
                                            onClick={() => setMainImage(index)}
                                        >
                                            {mainImageIndex === index ? <Check className="size-4" /> : <Upload className="size-4" />}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            className="size-8"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    {mainImageIndex === index && <Badge className="absolute top-2 left-2 bg-primary">Main</Badge>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Technologies */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Technologies Used</h3>
                <div className="grid grid-cols-2 gap-4">
                    {
                        skills.map((skill, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    id={`skill-${index}`}
                                    type="checkbox"
                                    checked={(project.technologies || []).includes(skill)}
                                    onChange={() => toggleTechnology(skill)}
                                    className="mr-2"
                                />
                                <label htmlFor={`skill-${index}`}>{skill}</label>
                            </div>
                        ))
                    }
                </div>

                {skills.length === 0 && (
                    <div className="text-center py-4 border rounded-md">
                        <p className="text-muted-foreground">No skills found. Add skills from the Skills section first.</p>
                    </div>
                )}

                {(project.technologies || []).length > 0 && (
                    <div>
                        <Label>Selected Technologies</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(project.technologies || []).map((techId) => {
                                const skill = skills.find((s) => s === techId)
                                return skill ? (
                                    <Badge key={techId} variant="secondary">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => toggleTechnology(techId)}
                                            className="ml-1 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : projectId ? "Update Project" : "Create Project"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}

