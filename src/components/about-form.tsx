"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { getAboutData, updateAboutData } from "@/lib/firebase/firestore"

type AboutData = {
    bio: string
    designation: string
}

export function AboutForm() {
    const [formData, setFormData] = useState<AboutData>({
        bio: "",
        designation: "",
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAboutData()
                if (data) {
                    setFormData(data as AboutData)
                }
            } catch (error) {
                console.error("Error fetching about data:", error)
                toast("Failed to fetch about information")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updateAboutData(formData)
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

