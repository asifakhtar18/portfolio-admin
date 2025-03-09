"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createTestimonial } from "@/lib/firebase/firestore"
import { uploadImage } from "@/lib/firebase/storage"

export function TestimonialForm() {
    const [formData, setFormData] = useState({
        name: "",
        position: "",
        company: "",
        message: "",
        rating: 5,
    })
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value)
        if (value >= 1 && value <= 5) {
            setFormData((prev) => ({ ...prev, rating: value }))
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            if (!formData.name || !formData.message) {
                throw new Error("Name and message are required")
            }

            let avatarUrl = ""
            if (avatarFile) {
                avatarUrl = await uploadImage(
                    avatarFile,
                    `testimonials/${Date.now()}_${formData.name.replace(/\s+/g, "-").toLowerCase()}`,
                )
            }

            await createTestimonial({
                ...formData,
                avatar: avatarUrl,
                rating: formData.rating,
            })

            toast("Testimonial submitted successfully")

            setSubmitted(true)
        } catch (error) {
            console.error("Error submitting testimonial:", error)
            toast("Failed to submit testimonial")
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Thank You!</CardTitle>
                    <CardDescription>
                        Your testimonial has been submitted and is awaiting approval. I appreciate your feedback!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                            <svg
                                className="h-8 w-8 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFormData({
                                name: "",
                                position: "",
                                company: "",
                                message: "",
                                rating: 5,
                            })
                            setAvatarFile(null)
                            setAvatarPreview(null)
                            setSubmitted(false)
                        }}
                    >
                        Submit Another Testimonial
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>
                    I'd love to hear about your experience working with me. Your testimonial will be published after review.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="CEO"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Acme Inc."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Your Testimonial *</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Share your experience working with me..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                                    className={`text-2xl focus:outline-none ${star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">({formData.rating}/5)</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar">Your Photo (Optional)</Label>
                        <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="cursor-pointer" />

                        {avatarPreview && (
                            <div className="mt-2">
                                <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                                    <Image src={avatarPreview || "/placeholder.svg"} alt="Avatar preview" fill className="object-cover" />
                                </div>
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Testimonial"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

