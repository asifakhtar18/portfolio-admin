"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { getSkills, updateSkills } from "@/lib/firebase/firestore"

export function SkillsForm() {
    const [skills, setSkills] = useState<string[]>([])
    const [newSkill, setNewSkill] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)


    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const data = await getSkills()
                if (data) {
                    setSkills(data)
                }
            } catch (error) {
                console.error("Error fetching skills:", error)
                toast("Failed to fetch skills")
            } finally {
                setLoading(false)
            }
        }

        fetchSkills()
    }, [])

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()])
            setNewSkill("")
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updateSkills(skills)
            toast("Skills updated successfully")
        } catch (error) {
            console.error("Error updating skills:", error)
            toast("Failed to update skills")
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
            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="newSkill">Add Skill</Label>
                        <div className="flex mt-2">
                            <Input
                                id="newSkill"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="e.g. React, Node.js, UI/UX Design"
                            />
                            <Button type="button" onClick={handleAddSkill} className="ml-2" variant="secondary">
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </div>
                    </div>
                </div>

                <div>
                    <Label>Current Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2 p-4 border rounded-md min-h-[100px]">
                        {skills.length === 0 ? (
                            <p className="text-muted-foreground">No skills added yet</p>
                        ) : (
                            skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="px-3 py-1">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    )
}

