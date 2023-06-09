'use client' 

import { authOptions } from "@/lib/auth";
import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, cn, toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { FunctionComponent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SideBarChatListProps {
    friends: User[],
    sessionId: string
}

interface ExtendedMessage extends Message{
    senderImg: string
    senderName: string
}
 
const SideBarChatList: FunctionComponent<SideBarChatListProps> = ({friends, sessionId}) => {

    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const router = useRouter()
    const pathName = usePathname()

    useEffect(()=>{
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))

        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = () =>{
            router.refresh()
        }

        const chatHandler = (message: ExtendedMessage) =>{
            const shouldNotify = pathName !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return

            //should be notified
            toast.custom((t)=>(
                //custom component
                <UnseenChatToast
                t={t}
                senderId={message.senderId}
                sessionId={sessionId}
                senderMessage={message.text}
                senderImg={message.senderImg}
                senderName={message.senderName}
                />
            ))

            setUnseenMessages((prev)=>[...prev, message])
        }

        pusherClient.bind('new_message', chatHandler)

        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`)),

            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_message', chatHandler)

            pusherClient.unbind('new_friend', newFriendHandler)

        }

    }, [pathName, sessionId, router])

    useEffect(()=>{
        if(pathName?.includes('chat')){
            setUnseenMessages((prev)=>{
                return prev.filter((msg)=>!pathName.includes(msg.senderId))
            })
        }
    }, [pathName])

    return ( 
        <ul 
        role="list" 
        className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1"
        >
            {friends.sort().map((friend)=>{
                const unseenMessagesCount = unseenMessages.filter((unseenMsg)=>{
                    return unseenMsg.senderId === friend.id
                }).length
                return <li key={friend.id}>
                    <a 
                    className={cn("text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",{'bg-indigo-200':unseenMessagesCount > 0})}
                    href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>{friend.name}
                    {unseenMessagesCount >0?(
                        <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                            {unseenMessagesCount}
                        </div>
                    ): null}
                    </a>
                </li>
            })}
        </ul>
     );
}
 
export default SideBarChatList;