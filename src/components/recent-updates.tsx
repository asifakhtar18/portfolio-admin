"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentUpdates } from "@/lib/firebase/firestore"
import { Spinner } from "@/components/ui/spinner"

type Update = {
    id: string
    section: string
    updatedAt: Date
    title: string
}

export function RecentUpdates() {
    const [updates, setUpdates] = useState<Update[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUpdates = async () => {
            try {
                const data = await getRecentUpdates()
                setUpdates(data)
            } catch (error) {
                console.error("Error fetching updates:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUpdates()
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>Your most recent content changes</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Spinner />
                    </div>
                ) : updates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No recent updates found</p>
                ) : (
                    <div className="space-y-4">
                        {updates.map((update) => (
                            <div key={update.id} className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{update.title}</p>
                                    <p className="text-sm text-muted-foreground">{update.section}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(update.updatedAt, { addSuffix: true })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

