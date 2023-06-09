'use client'

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { X } from "lucide-react";
import { Check, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FunctionComponent, useEffect, useState } from "react";


interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[],
    sessionId: string | undefined
}
 
const FriendRequests: FunctionComponent<FriendRequestsProps> = ({incomingFriendRequests, sessionId}) => {

    const router = useRouter()

    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)

    //accept friend
    const acceptRequest = async (senderId: string) =>{
        await axios.post(`/api/friends/accept`, {id: senderId})

        setFriendRequests((prev)=>
            prev.filter((request)=>request.senderId!==senderId)
        )

        router.refresh()
    }

    //decline friend
    const declineRequest = async (senderId: string) =>{
        await axios.post(`/api/friends/decline`, {id: senderId})

        setFriendRequests((prev)=>
            prev.filter((request)=>request.senderId!==senderId)
        )

        router.refresh()
    }


    useEffect(()=>{
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

        const friendRequestHandler = ({senderId, senderEmail}: IncomingFriendRequest) =>{
            setFriendRequests((prev)=>[
                ...prev, {senderEmail, senderId}
            ])
        }

        pusherClient.bind(`incoming_friend_requests`, friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

            pusherClient.unbind(`incoming_friend_requests`, friendRequestHandler)
        }
    }, [sessionId])

    return ( 
        <>
        {friendRequests.length === 0 ? (
            <p className="text-sm text-zinc-500 ">No incoming requests at the moment...</p>
        ): (
            friendRequests.map((request)=>(
                <div 
                className="flex gap-4 items-center"
                key={request.senderId}>
                    <UserPlus className="text-black"/>
                    <p className="font-medium text-lg">{request.senderEmail}</p>
                    <button
                    onClick={()=>{acceptRequest(request.senderId)}}
                    className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
                    aria-label="Accept friend request" 
                    >
                        <Check className="font-semibold text-white w-3/4 h-3/4"/>
                    </button>
                     <button
                     onClick={()=>declineRequest(request.senderId)}
                    className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
                    aria-label="Accept friend request" 
                    >
                        <X className="font-semibold text-white w-3/4 h-3/4"/>
                    </button>
                </div>
            ))
        )}
        </>
    );
}
 
export default FriendRequests;