"use client"

import { useEffect, useState } from "react"
import { Mail } from "lucide-react"
import { getMessages } from "@/lib/api/messages"
import type { MessageResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { PageHeader } from "@/components/page-header"
import { PageTransition, Stagger, FadeItem } from "@/components/ui/motion"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

type Message = MessageResponse

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getMessages()
                setMessages(data)
            } catch (error) {
                console.error("Error fetching messages:", error)
                toast(error instanceof ApiError ? error.message : "Could not load messages")
            } finally {
                setLoading(false)
            }
        }
        fetchMessages()
    }, [])

    return (
        <PageTransition>
            <PageHeader
                title="Messages"
                description="Messages visitors sent through your portfolio's contact form."
            />

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size="lg" />
                </div>
            ) : messages.length === 0 ? (
                <div className="rounded-lg border border-dashed py-14 text-center">
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                    <p className="text-sm text-muted-foreground">
                        When someone writes to you from your portfolio, it shows up here.
                    </p>
                </div>
            ) : (
                <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {messages.map((message) => (
                        <FadeItem key={message.id} className="flex flex-col rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {message.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-medium">{message.name}</h3>
                                    <p className="truncate text-xs text-muted-foreground">{message.email}</p>
                                </div>
                            </div>

                            <p className="mt-3 flex-1 text-sm text-foreground/90">{message.message}</p>

                            <div className="mt-4 flex items-center justify-between border-t pt-3">
                                <span className="tabular text-xs text-muted-foreground">
                                    {new Date(message.createdAt).toLocaleDateString("en-US", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                                <a
                                    href={`mailto:${message.email}?subject=Re: Message from your portfolio`}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    Reply
                                </a>
                            </div>
                        </FadeItem>
                    ))}
                </Stagger>
            )}
        </PageTransition>
    )
}
