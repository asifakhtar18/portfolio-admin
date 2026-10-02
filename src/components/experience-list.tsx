"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Edit, Trash2, Plus, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
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
import { getExperiences, deleteExperience } from "@/lib/api/experiences"
import { ApiError } from "@/lib/api/client"
import type { ExperienceResponse } from "@/lib/api/types"

type Experience = ExperienceResponse

/**
 * Experience entries as scannable rows with a deliberate entrance (staggered on
 * load) and exit (row animates out on delete). API calls and the delete-confirm
 * flow are unchanged. Motion respects reduced-motion.
 */
export function ExperienceList() {
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [toDelete, setToDelete] = useState<Experience | null>(null)
    const [deleting, setDeleting] = useState(false)
    const reduce = useReducedMotion()

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const data = await getExperiences()
                setExperiences(data)
            } catch (error) {
                console.error("Error fetching experiences:", error)
                toast(error instanceof ApiError ? error.message : "Could not load experience")
            } finally {
                setLoading(false)
            }
        }
        fetchExperiences()
    }, [])

    const handleDelete = async () => {
        if (!toDelete) return
        try {
            setDeleting(true)
            await deleteExperience(toDelete.id)
            setExperiences((prev) => prev.filter((e) => e.id !== toDelete.id))
            toast(`Deleted "${toDelete.title}"`)
        } catch (error) {
            console.error("Error deleting experience:", error)
            toast(error instanceof ApiError ? error.message : "Could not delete experience")
        } finally {
            setDeleting(false)
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

    if (experiences.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-14 text-center">
                <p className="text-sm text-muted-foreground">No experience yet.</p>
                <p className="mb-4 text-sm text-muted-foreground">Add a role to build your work history.</p>
                <Link href="/admin/experience/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        New role
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div>
            <ul className="divide-y rounded-lg border bg-card">
                <AnimatePresence initial={!reduce}>
                    {experiences.map((experience, i) => (
                        <motion.li
                            key={experience.id}
                            layout={!reduce}
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.24, delay: reduce ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-start gap-4 p-4"
                        >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <h3 className="font-medium">{experience.title}</h3>
                                    <span className="text-sm text-muted-foreground">{experience.company}</span>
                                </div>
                                <p className="tabular mt-0.5 text-xs text-muted-foreground">
                                    {experience.startDate} — {experience.endDate || "Present"}
                                </p>
                                {experience.description ? (
                                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                                        {experience.description}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <Link href={`/admin/experience/${experience.id}`}>
                                    <Button variant="ghost" size="icon" title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setToDelete(experience)}
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

            <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this role?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {toDelete
                                ? `"${toDelete.title}" at ${toDelete.company} will be permanently removed. This can't be undone.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting…" : "Delete role"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
