import { FetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { nanoid } from "nanoid"
import { Message, messageValidator } from "@/lib/validations/message"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"

export async function POST(req: Request){
    try{
        const {text, chatid} = await req.json()

        const session = await getServerSession(authOptions)

        if (!session) return new Response('Unauthorized', {status:401})

        const [userId1, userId2] = chatid.split('--')

        if (session.user.id !== userId1 && session.user.id !== userId2){
            return new Response('Unauthorised', {status: 401})
        }

        const friendId = session.user.id === userId1? userId2 : userId1

        const friendList = await FetchRedis('smembers', `user:${session.user.id}:friends`) as string[]

        const isFriend = friendList.includes(friendId)

        if(!isFriend) return new Response('Unathorized', { status: 401})

        const rawSender = await FetchRedis('get', `user:${session.user.id}`) as string

        const sender = JSON.parse(rawSender) as User

        const timeStamp = Date.now()

        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text: text,
            timestamp: timeStamp,
            // receiverId:friendId
        }

        const message = messageValidator.parse(messageData)

        //notify all connected chat rooms
        pusherServer.trigger(toPusherKey(`chat:${chatid}`), 'incoming-message', message)

        pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName: sender.name,
        })

        //add to a sorted list
        await db.zadd(`chat:${chatid}:messages`, {
            score: timeStamp,
            member: JSON.stringify(message)
        })

        console.log('sender', sender)

        return new Response('OK')

    }catch (err){
        if(err instanceof Error){
            return new Response(err.message, {status:500 })
        }
        console.log(err)
        return new Response ('internal server error', {status: 500})
    }
}