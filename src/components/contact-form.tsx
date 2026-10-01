"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getContactInfo, updateContactInfo } from "@/lib/api/contact"
import { ApiError } from "@/lib/api/client"
import { SocialMediaEditor, validateSocialUrl } from "@/components/social-media-editor"

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
                const data = await getContactInfo()
                if (data) {
                    setFormData({
                        email: data.email,
                        phone: data.phone,
                        socialMedia: data.socialMedia ?? [],
                    })
                }
            } catch (error) {
                console.error("Error fetching contact data:", error)
                toast(error instanceof ApiError ? error.message : "Failed to fetch contact information")
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

    const handleSocialMediaChange = (socialMedia: ContactData["socialMedia"]) => {
        setFormData((prev) => ({ ...prev, socialMedia }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Block saving when any filled-in social URL is invalid, and drop fully
        // empty rows so blank entries aren't persisted.
        const invalid = formData.socialMedia.find((s) => validateSocialUrl(s.url) !== null)
        if (invalid) {
            toast("Fix the highlighted social link URL before saving")
            return
        }
        const socialMedia = formData.socialMedia.filter(
            (s) => s.platform.trim().length > 0 && s.url.trim().length > 0,
        )

        setSaving(true)

        try {
            await updateContactInfo({
                email: formData.email,
                phone: formData.phone,
                socialMedia,
            })
            toast("Contact information updated successfully")
        } catch (error) {
            console.error("Error updating contact data:", error)
            toast(error instanceof ApiError ? error.message : "Failed to update contact information")
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

            <SocialMediaEditor value={formData.socialMedia} onChange={handleSocialMediaChange} />

            <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}

