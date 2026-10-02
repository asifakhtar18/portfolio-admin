"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Edit, Trash2, Star, ExternalLink, ImageOff, Plus } from "lucide-react"
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
import { getProjects, deleteProject } from "@/lib/api/projects"
import { ApiError } from "@/lib/api/client"
import type { ProjectResponse } from "@/lib/api/types"

type Project = ProjectResponse

/**
 * Projects list rendered as scannable rows (thumbnail + title + summary + tech
 * + actions) rather than a uniform card grid — the row structure makes a long
 * list easier to scan and keeps hierarchy clear. All API calls and the
 * delete-confirm flow are unchanged.
 */
export function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const [deleting, setDeleting] = useState(false)
    const reduce = useReducedMotion()

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects()
                setProjects(data)
            } catch (error) {
                console.error("Error fetching projects:", error)
                toast(error instanceof ApiError ? error.message : "Could not load projects")
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [])

    const handleDelete = async () => {
        if (!projectToDelete) return
        try {
            setDeleting(true)
            await deleteProject(projectToDelete.id)
            setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
            toast(`Deleted "${projectToDelete.name}"`)
        } catch (error) {
            console.error("Error deleting project:", error)
            toast(error instanceof ApiError ? error.message : "Could not delete project")
        } finally {
            setDeleting(false)
            setProjectToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="rounded-lg border border-dashed py-14 text-center">
                <p className="text-sm text-muted-foreground">No projects yet.</p>
                <p className="mb-4 text-sm text-muted-foreground">
                    Add your first project to show it on your portfolio.
                </p>
                <Link href="/admin/projects/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        New project
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div>
            <ul className="divide-y rounded-lg border bg-card">
                <AnimatePresence initial={!reduce}>
                {projects.map((project, i) => {
                    const mainImage = project.images?.find((img) => img.isMain) ?? project.images?.[0]
                    return (
                        <motion.li
                            key={project.id}
                            layout={!reduce}
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.24, delay: reduce ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-4 p-3 sm:p-4"
                        >
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                                {mainImage?.url ? (
                                    <Image src={mainImage.url} alt={project.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <ImageOff className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="truncate font-medium">{project.name}</h3>
                                    {project.featured ? (
                                        <span
                                            className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[11px] text-primary"
                                            title="Featured"
                                        >
                                            <Star className="h-3 w-3 fill-current" />
                                            Featured
                                        </span>
                                    ) : null}
                                    {project.link ? (
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-muted-foreground hover:text-foreground"
                                            title="Open live link"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    ) : null}
                                </div>
                                {project.description ? (
                                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                        {project.description}
                                    </p>
                                ) : null}
                                {project.technologies?.length ? (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {project.technologies.slice(0, 5).map((tech) => (
                                            <span
                                                key={tech}
                                                className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {project.technologies.length > 5 ? (
                                            <span className="px-1 py-0.5 text-[11px] text-muted-foreground">
                                                +{project.technologies.length - 5}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                                <Link href={`/admin/projects/${project.id}`}>
                                    <Button variant="ghost" size="icon" title="Edit">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setProjectToDelete(project)}
                                    title="Delete"
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.li>
                    )
                })}
                </AnimatePresence>
            </ul>

            <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {projectToDelete
                                ? `"${projectToDelete.name}" and its images will be permanently removed. This can't be undone.`
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
                            {deleting ? "Deleting…" : "Delete project"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
