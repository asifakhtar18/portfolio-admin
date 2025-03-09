"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getAboutData, updateAboutData } from "@/lib/firebase/firestore"
import { uploadImage, deleteImage } from "@/lib/firebase/storage"
import type { AboutData } from "@/lib/types"

export function AboutForm() {
    const [formData, setFormData] = useState<AboutData>({
        bio: "",
        designation: "",
        profileImage: "",
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAboutData()
                if (data) {
                    setFormData(data as AboutData)
                    if (data.profileImage) {
                        setProfileImagePreview(data.profileImage)
                    }
                }
            } catch (error) {
                console.error("Error fetching about data:", error)
                toast("Failed to fetch about data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setProfileImageFile(file)
            setProfileImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            let profileImage = formData.profileImage || ""

            // Handle profile image upload
            if (profileImageFile) {
                // Delete old image if exists
                if (formData.profileImage) {
                    await deleteImage(formData.profileImage)
                }

                // Upload new image
                profileImage = await uploadImage(
                    profileImageFile,
                    `profile/${Date.now()}_profile.${profileImageFile.name.split(".").pop()}`,
                )
            }

            const updatedData: AboutData = {
                ...formData,
                profileImage,
            }

            await updateAboutData(updatedData)
            setFormData(updatedData)

            toast("About information updated successfully")
        } catch (error) {
            console.error("Error updating about data:", error)
            toast("Failed to update about information")
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
                <Label htmlFor="designation">Designation/Title</Label>
                <Input
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Picture</Label>
                <Input id="profileImage" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />

                {profileImagePreview && (
                    <div className="mt-4 flex justify-center">
                        <div className="relative h-48 w-48 rounded-full overflow-hidden border">
                            <Image
                                src={profileImagePreview || "/placeholder.svg"}
                                alt="Profile preview"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Write your bio here..."
                    rows={8}
                />
            </div>

            <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}

