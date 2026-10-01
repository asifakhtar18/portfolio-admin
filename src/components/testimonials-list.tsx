"use client"

import { useEffect, useState } from "react"
import { Trash2, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getTestimonials, setTestimonialApproval, deleteTestimonial } from "@/lib/api/testimonials"
import { ApiError } from "@/lib/api/client"
import type { Testimonial } from "@/lib/types"

export function TestimonialsList() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchTestimonials()
    }, [])

    const fetchTestimonials = async () => {
        try {
            setLoading(true)
            const data = await getTestimonials()
            setTestimonials(data)
        } catch (error) {
            console.error("Error fetching testimonials:", error)
            toast(error instanceof ApiError ? error.message : "Failed to fetch testimonials")
        } finally {
            setLoading(false)
        }
    }

    const handleSetApproval = async (id: string, isApproved: boolean) => {
        try {
            setSaving(true)
            const updated = await setTestimonialApproval(id, isApproved)

            setTestimonials((prev) =>
                prev.map((item) => (item.id === id ? { ...item, isApproved: updated.isApproved } : item)),
            )

            toast(isApproved ? "Testimonial approved" : "Testimonial moved back to pending")
        } catch (error) {
            console.error("Error updating testimonial approval:", error)
            toast(error instanceof ApiError ? error.message : "Failed to update testimonial")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!testimonialToDelete) return

        try {
            setSaving(true)
            await deleteTestimonial(testimonialToDelete)

            setTestimonials((prev) => prev.filter((item) => item.id !== testimonialToDelete))

            toast("Testimonial deleted successfully")
        } catch (error) {
            console.error("Error deleting testimonial:", error)
            toast(error instanceof ApiError ? error.message : "Failed to delete testimonial")
        } finally {
            setSaving(false)
            setTestimonialToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Spinner size="lg" />
            </div>
        )
    }

    if (testimonials.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No testimonials found</p>
            </div>
        )
    }

    const pendingTestimonials = testimonials.filter((item) => !item.isApproved)
    const approvedTestimonials = testimonials.filter((item) => item.isApproved)

    return (
        <div>
            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending Approval ({pendingTestimonials.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedTestimonials.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 mt-4">
                    {pendingTestimonials.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No pending testimonials</p>
                        </div>
                    ) : (
                        pendingTestimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                testimonial={testimonial}
                                onApprove={() => handleSetApproval(testimonial.id, true)}
                                onDelete={() => setTestimonialToDelete(testimonial.id)}
                                pendingView
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4 mt-4">
                    {approvedTestimonials.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No approved testimonials</p>
                        </div>
                    ) : (
                        approvedTestimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                testimonial={testimonial}
                                onUnapprove={() => handleSetApproval(testimonial.id, false)}
                                onDelete={() => setTestimonialToDelete(testimonial.id)}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>


            <AlertDialog open={!!testimonialToDelete} onOpenChange={() => setTestimonialToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the testimonial.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            {saving ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

type TestimonialCardProps = {
    testimonial: Testimonial
    onApprove?: () => void
    onUnapprove?: () => void
    onDelete: () => void
    pendingView?: boolean
}

function TestimonialCard({
    testimonial,
    onApprove,
    onUnapprove,
    onDelete,
    pendingView = false,
}: TestimonialCardProps) {
    return (
        <div className="border rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-4">
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

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{testimonial.name}</h3>
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`size-4 ${i < (testimonial.rating ?? 0) ? "text-yellow-400" : "text-gray-300"}`}>
                                    ★
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                        {testimonial.company ? ` at ${testimonial.company}` : ""}
                    </p>

                    <p className="text-sm mt-2">{testimonial.message}</p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t">
                        <p className="text-xs text-muted-foreground">Received: {new Date(testimonial.createdAt).toLocaleDateString()}</p>

                        <div className="flex gap-1">
                            {pendingView ? (
                                <Button size="sm" variant="outline" onClick={onApprove} title="Approve">
                                    <CheckCircle className="size-4 mr-1" />
                                    Approve
                                </Button>
                            ) : (
                                onUnapprove && (
                                    <Button size="sm" variant="outline" onClick={onUnapprove} title="Move back to pending">
                                        <XCircle className="size-4 mr-1" />
                                        Unapprove
                                    </Button>
                                )
                            )}

                            <Button size="icon" variant="ghost" onClick={onDelete} title="Delete">
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

