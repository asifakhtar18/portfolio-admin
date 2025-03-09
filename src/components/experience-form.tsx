"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { getExperience, createExperience, updateExperience } from "@/lib/firebase/firestore"
import { uploadImage, deleteImage } from "@/lib/firebase/storage"
import { toast } from "sonner"


type ExperienceFormProps = {
    experienceId?: string
}

export type ExperienceData = {
    title: string
    company: string
    startDate: string
    endDate: string
    description: string
    imageUrl?: string
}

export function ExperienceForm({ experienceId }: ExperienceFormProps) {
    const [formData, setFormData] = useState<ExperienceData>({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        imageUrl: "",
    })
    const [loading, setLoading] = useState(experienceId ? true : false)
    const [saving, setSaving] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const router = useRouter()


    useEffect(() => {
        if (experienceId) {
            const fetchExperience = async () => {
                try {
                    const data = await getExperience(experienceId) as unknown as ExperienceData
                    if (data) {
                        setFormData(data)
                        if (data.imageUrl && data.imageUrl !== "") {
                            setImagePreview(data.imageUrl)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching experience:", error)
                    toast("Failed to fetch experience")
                } finally {
                    setLoading(false)
                }
            }

            fetchExperience()
        }
    }, [experienceId])

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
            let imageUrl = formData.imageUrl || ""

            if (imageFile) {
                if (formData.imageUrl) {
                    await deleteImage(formData.imageUrl)
                }

                imageUrl = await uploadImage(
                    imageFile,
                    `experience/${Date.now()}_${formData.company.replace(/\s+/g, "-").toLowerCase()}`,
                )
            }

            const experienceData = {
                ...formData,
                imageUrl,
            }

            if (experienceId) {
                await updateExperience(experienceId, experienceData)
                toast("Experience updated successfully")
            } else {
                await createExperience(experienceData)
                toast("Experience created successfully")
                router.push("/admin/experience")
            }
        } catch (error) {
            console.error("Error saving experience:", error)
            toast("Failed to save experience")
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
                <Label htmlFor="title">Job Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Developer"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Inc."
                    required
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        placeholder="e.g. Jan 2020"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (leave empty for current position)</Label>
                    <Input
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        placeholder="e.g. Dec 2022"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={4}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Company Logo or Related Image (Optional)</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />

                {imagePreview && (
                    <div className="mt-4 relative h-40 w-full sm:w-60 border rounded-md overflow-hidden">
                        <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Experience image preview"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : experienceId ? "Update Experience" : "Add Experience"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/admin/experience")}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}

