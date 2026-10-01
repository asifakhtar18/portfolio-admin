"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { getExperiences, deleteExperience } from "@/lib/api/experiences"
import { ApiError } from "@/lib/api/client"
import type { ExperienceResponse } from "@/lib/api/types"

type Experience = ExperienceResponse

export function ExperienceList() {
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null)


    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const data = await getExperiences()
                setExperiences(data)
            } catch (error) {
                console.error("Error fetching experiences:", error)
                toast(error instanceof ApiError ? error.message : "Failed to fetch experiences")
            } finally {
                setLoading(false)
            }
        }

        fetchExperiences()
    }, [])

    const handleDelete = async () => {
        if (!experienceToDelete) return

        try {
            await deleteExperience(experienceToDelete)
            setExperiences(experiences.filter((exp) => exp.id !== experienceToDelete))
            toast("Experience deleted successfully")
        } catch (error) {
            console.error("Error deleting experience:", error)
            toast(error instanceof ApiError ? error.message : "Failed to delete experience")
        } finally {
            setExperienceToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Spinner size="lg" />
            </div>
        )
    }

    if (experiences.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No experience entries found</p>
                <Link href="/admin/experience/new">
                    <Button>Add Your First Experience</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {experiences.map((experience) => (
                <div key={experience.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">{experience.title}</h3>
                            <p className="text-muted-foreground">{experience.company}</p>
                            <p className="text-sm text-muted-foreground">
                                {experience.startDate} - {experience.endDate || "Present"}
                            </p>
                            <p className="mt-2 text-sm">{experience.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/admin/experience/${experience.id}`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => setExperienceToDelete(experience.id)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            <AlertDialog open={!!experienceToDelete} onOpenChange={() => setExperienceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this experience entry.
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

