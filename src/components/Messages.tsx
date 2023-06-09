'use client'

import { cn } from "@/lib/utils";
import { FunctionComponent, useRef, useState } from "react";
import { Message } from "@/lib/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect } from "react";
import { toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";


interface MessagesProps {
    initialMessages: Message[],
    sessionId: string,
    sessionImg: string | null | undefined,
    chatPartner: User,
    chatid: string,
}
 
const Messages: FunctionComponent<MessagesProps> = ({initialMessages, sessionId, chatPartner, sessionImg, chatid}) => {

     useEffect(()=>{
        pusherClient.subscribe(toPusherKey(`chat:${chatid}`))

        const messageHandler = (message: Message) =>{
            setMessages((prev)=>[message, ...prev])
        }

        pusherClient.bind(`incoming-message`, messageHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`chat:${chatid}`))

            pusherClient.unbind(`incoming-message`, messageHandler)
        }
    }, [chatid])

    const [messages, setMessages] = useState<Message[]>(initialMessages)

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimestamp = (timestamp: number) =>{
        return format(timestamp, 'HH:MM')
    }

    return ( 
        <div 
        className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        id="messages">
            <div ref={scrollDownRef}/>
            {
                messages.map((message, index)=>{
                    const isCurrentUser = message.senderId === sessionId

                    const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId

                    return <div 
                    key={`${message.id}-${message.timestamp}`}>
                        <div 
                        className={cn('flex items-end', {
                            'justify-end': isCurrentUser,
                        })}
                        >
                            <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                                'order-1 items-end': isCurrentUser,
                                'order-2 items-start': !isCurrentUser
                            })}>
                                <span className={cn('px-4 py-2 rounded-lg inline-block',{
                                    'bg-indigo-600 text-white': isCurrentUser,
                                    'bg-gray-200 text-gray-900': !isCurrentUser,
                                    'rounded-br-none':hasNextMessageFromSameUser && isCurrentUser,
                                    'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser,
                                })}>
                                    {message.text}{' '}
                                    <span className="ml-2 text-xs text-gray-400">
                                        {formatTimestamp(message.timestamp)}
                                    </span>
                                </span>
                            </div>
                            
                            <div className={cn('relative w-6 h-6', {
                                'order-2': isCurrentUser,
                                'order-1': !isCurrentUser,
                                invisible: hasNextMessageFromSameUser
                            })}>
                                <Image
                                fill
                                src={
                                    isCurrentUser?(sessionImg as string): chatPartner.image
                                }
                                alt="Profile picture"
                                referrerPolicy="no-referrer"
                                className="rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                })
            }
        </div>
     );
}
 
export default Messages;
