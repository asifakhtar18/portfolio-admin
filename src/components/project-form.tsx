"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getProject, createProject, updateProject } from "@/lib/firebase/firestore"
import { uploadImage, deleteImage } from "@/lib/firebase/storage"

type ProjectFormProps = {
    projectId?: string
}

type ProjectData = {
    name: string
    description: string
    link: string
    imageUrl: string
}

export function ProjectForm({ projectId }: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectData>({
        name: "",
        description: "",
        link: "",
        imageUrl: "",
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(projectId ? true : false)
    const [saving, setSaving] = useState(false)
    const router = useRouter()


    useEffect(() => {
        if (projectId) {
            const fetchProject = async () => {
                try {
                    const data = await getProject(projectId)
                    if (data) {
                        setFormData(data as ProjectData)
                        if (data.imageUrl) {
                            setImagePreview(data.imageUrl)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching project:", error)
                    toast("Failed to fetch project")
                } finally {
                    setLoading(false)
                }
            }

            fetchProject()
        }
    }, [projectId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            let imageUrl = formData.imageUrl

            // Upload new image if selected
            if (imageFile) {
                // Delete old image if updating and there's an existing image
                if (projectId && formData.imageUrl) {
                    await deleteImage(formData.imageUrl)
                }

                // Upload new image
                imageUrl = await uploadImage(imageFile, `projects/${Date.now()}_${imageFile.name}`)
            }

            const projectData = {
                ...formData,
                imageUrl,
            }

            if (projectId) {
                await updateProject(projectId, projectData)
                toast("Project updated successfully")
            } else {
                await createProject(projectData)
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
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
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your project..."
                    rows={4}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="link">Project Link (Optional)</Label>
                <Input id="link" name="link" value={formData.link} onChange={handleChange} placeholder="https://example.com" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Project Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
                {imagePreview && (
                    <div className="mt-4 relative h-48 w-full border rounded-md overflow-hidden">
                        <Image src={imagePreview || "/placeholder.svg"} alt="Project preview" fill className="object-cover" />
                    </div>
                )}
            </div>

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

