"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getContactData, updateContactData } from "@/lib/firebase/firestore"

type ContactData = {
    email: string
    phone: string
    socialMedia: {
        platform: string
        url: string
    }[]
}

export function ContactForm() {
    const [formData, setFormData] = useState<ContactData>({
        email: "",
        phone: "",
        socialMedia: [],
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getContactData()
                if (data) {
                    setFormData(data)
                }
            } catch (error) {
                console.error("Error fetching contact data:", error)
                toast("Failed to fetch contact information")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSocialMediaChange = (index: number, field: string, value: string) => {
        setFormData((prev) => {
            const updatedSocialMedia = [...prev.socialMedia]
            updatedSocialMedia[index] = {
                ...updatedSocialMedia[index],
                [field]: value,
            }
            return { ...prev, socialMedia: updatedSocialMedia }
        })
    }

    const addSocialMedia = () => {
        setFormData((prev) => ({
            ...prev,
            socialMedia: [...prev.socialMedia, { platform: "", url: "" }],
        }))
    }

    const removeSocialMedia = (index: number) => {
        setFormData((prev) => {
            const updatedSocialMedia = [...prev.socialMedia]
            updatedSocialMedia.splice(index, 1)
            return { ...prev, socialMedia: updatedSocialMedia }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updateContactData(formData)
            toast("Contact information updated successfully")
        } catch (error) {
            console.error("Error updating contact data:", error)
            toast("Failed to update contact information")
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
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (123) 456-7890" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Social Media</Label>
                    <Button type="button" onClick={addSocialMedia} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Platform
                    </Button>
                </div>

                {formData.socialMedia.map((social, index) => (
                    <div key={index} className="grid gap-4 sm:grid-cols-2 items-center">
                        <div className="space-y-2">
                            <Label htmlFor={`platform-${index}`}>Platform</Label>
                            <Input
                                id={`platform-${index}`}
                                value={social.platform}
                                onChange={(e) => handleSocialMediaChange(index, "platform", e.target.value)}
                                placeholder="e.g. LinkedIn, GitHub, Twitter"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`url-${index}`}>URL</Label>
                            <div className="flex">
                                <Input
                                    id={`url-${index}`}
                                    value={social.url}
                                    onChange={(e) => handleSocialMediaChange(index, "url", e.target.value)}
                                    placeholder="https://..."
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSocialMedia(index)}
                                    className="ml-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}

