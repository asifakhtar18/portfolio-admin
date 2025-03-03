"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2 } from "lucide-react"
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
import { getProjects, deleteProject } from "@/lib/firebase/firestore"

type Project = {
    id: string
    name: string
    description: string
    imageUrl: string
    link?: string
}

export function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null)


    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getProjects()
                setProjects(data as Project[])
            } catch (error) {
                console.error("Error fetching projects:", error)
                toast("Failed to fetch projects")
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    const handleDelete = async () => {
        if (!projectToDelete) return

        try {
            await deleteProject(projectToDelete)
            setProjects(projects.filter((project) => project.id !== projectToDelete))
            toast("Project deleted successfully")
        } catch (error) {
            console.error("Error deleting project:", error)
            toast("Failed to delete project")
        } finally {
            setProjectToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Spinner size="lg" />
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No projects found</p>
                <Link href="/admin/projects/new">
                    <Button>Add Your First Project</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg overflow-hidden">
                        <div className="relative h-48 w-full">
                            <Image
                                src={project.imageUrl || "/placeholder.svg?height=200&width=400"}
                                alt={project.name}
                                className="object-cover"
                                fill

                            />
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{project.description}</p>
                            <div className="flex justify-end gap-2 mt-4">
                                <Link href={`/admin/projects/${project.id}`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={() => setProjectToDelete(project.id)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project and remove the data from the
                            server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

