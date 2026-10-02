"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Trash2, CheckCircle, XCircle, Star } from "lucide-react"
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

/**
 * Testimonials moderation: Pending / Approved tabs, approve, unapprove, and
 * delete. Rows animate in on load and out when they move between tabs or are
 * deleted (AnimatePresence), making the state change visible — motion that
 * answers an action. API calls are unchanged.
 */
export function TestimonialsList() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [toDelete, setToDelete] = useState<Testimonial | null>(null)
    const [busy, setBusy] = useState(false)

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
            toast(error instanceof ApiError ? error.message : "Could not load testimonials")
        } finally {
            setLoading(false)
        }
    }

    const handleSetApproval = async (id: string, isApproved: boolean) => {
        try {
            setBusy(true)
            const updated = await setTestimonialApproval(id, isApproved)
            setTestimonials((prev) =>
                prev.map((item) => (item.id === id ? { ...item, isApproved: updated.isApproved } : item)),
            )
            toast(isApproved ? "Approved — now visible on your portfolio" : "Moved back to pending")
        } catch (error) {
            console.error("Error updating testimonial approval:", error)
            toast(error instanceof ApiError ? error.message : "Could not update testimonial")
        } finally {
            setBusy(false)
        }
    }

    const handleDelete = async () => {
        if (!toDelete) return
        try {
            setBusy(true)
            await deleteTestimonial(toDelete.id)
            setTestimonials((prev) => prev.filter((item) => item.id !== toDelete.id))
            toast(`Deleted testimonial from ${toDelete.name}`)
        } catch (error) {
            console.error("Error deleting testimonial:", error)
            toast(error instanceof ApiError ? error.message : "Could not delete testimonial")
        } finally {
            setBusy(false)
            setToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    const pending = testimonials.filter((t) => !t.isApproved)
    const approved = testimonials.filter((t) => t.isApproved)

    return (
        <div>
            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                    <TestimonialRows
                        items={pending}
                        emptyText="Nothing waiting for review."
                        onApprove={(id) => handleSetApproval(id, true)}
                        onDelete={setToDelete}
                        busy={busy}
                        pendingView
                    />
                </TabsContent>

                <TabsContent value="approved" className="mt-4">
                    <TestimonialRows
                        items={approved}
                        emptyText="No approved testimonials yet."
                        onUnapprove={(id) => handleSetApproval(id, false)}
                        onDelete={setToDelete}
                        busy={busy}
                    />
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {toDelete
                                ? `The testimonial from ${toDelete.name} will be permanently removed. This can't be undone.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            disabled={busy}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {busy ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function TestimonialRows({
    items,
    emptyText,
    onApprove,
    onUnapprove,
    onDelete,
    busy,
    pendingView = false,
}: {
    items: Testimonial[]
    emptyText: string
    onApprove?: (id: string) => void
    onUnapprove?: (id: string) => void
    onDelete: (t: Testimonial) => void
    busy: boolean
    pendingView?: boolean
}) {
    const reduce = useReducedMotion()

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-12 text-center">
                <p className="text-sm text-muted-foreground">{emptyText}</p>
            </div>
        )
    }

    return (
        <ul className="divide-y rounded-lg border bg-card">
            <AnimatePresence initial={!reduce}>
                {items.map((t, i) => (
                    <motion.li
                        key={t.id}
                        layout={!reduce}
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, delay: reduce ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-start gap-4 p-4"
                    >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
                            {t.avatar ? (
                                <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-medium text-primary">
                                    {t.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2">
                                <h3 className="font-medium">{t.name}</h3>
                                {typeof t.rating === "number" && t.rating > 0 ? (
                                    <span className="flex items-center" title={`${t.rating} of 5`}>
                                        {Array.from({ length: 5 }).map((_, s) => (
                                            <Star
                                                key={s}
                                                className={
                                                    "h-3.5 w-3.5 " +
                                                    (s < (t.rating ?? 0)
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-muted-foreground/30")
                                                }
                                            />
                                        ))}
                                    </span>
                                ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t.role}
                                {t.company ? ` · ${t.company}` : ""}
                            </p>
                            <p className="mt-1.5 text-sm">{t.message}</p>
                            <p className="tabular mt-2 text-xs text-muted-foreground">
                                Received {new Date(t.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            {pendingView ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onApprove?.(t.id)}
                                    disabled={busy}
                                    title="Approve"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </Button>
                            ) : onUnapprove ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onUnapprove(t.id)}
                                    disabled={busy}
                                    title="Move back to pending"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Unapprove
                                </Button>
                            ) : null}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onDelete(t)}
                                disabled={busy}
                                title="Delete"
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.li>
                ))}
            </AnimatePresence>
        </ul>
    )
}
