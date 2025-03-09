'use client'
import { getMessages } from "@/lib/firebase/firestore";
import { useEffect, useState } from "react";

interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: any;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    console.log(messages);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await getMessages();
                setMessages(fetchedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">Manage your portfolio messages</p>
            </div>

            {loading ? (
                <div>Loading messages...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {messages.map((message) => (
                        <div key={message.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-3 md:space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary text-sm md:text-base font-semibold">
                                        {message.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm md:text-base">{message.name}</h3>
                                    <p className="text-xs md:text-sm text-muted-foreground">{message.email}</p>
                                </div>
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">
                                {message.message}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                    {new Date(typeof message.createdAt.toDate === 'function'
                                        ? message.createdAt.toDate()
                                        : message.createdAt).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    {' '}
                                    {new Date(typeof message.createdAt.toDate === 'function'
                                        ? message.createdAt.toDate()
                                        : message.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                </div>
                                <a
                                    href={`mailto:${message.email}?subject=Re: Message from Portfolio - ${message.name}`}
                                    className="inline-flex items-center justify-center rounded-md text-xs md:text-sm px-2.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    Reply
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}