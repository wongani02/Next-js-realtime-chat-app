import { FetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request){
    try{
        const body = await req.json()

        const {id: idToAdd} = z.object({id:z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unathorised', {status: 401})
        }

        //verify both users are not already friends
        const isAlreadyFriends = await FetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)

        if (isAlreadyFriends){
            return new Response('Already friends', {status:400})
        }

        //if a send request has actually been sent
        const hasFriendRequest= await FetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)

        console.log('hasFriendRequest? ', hasFriendRequest)

        if(!hasFriendRequest){
            return new Response('No friend request', {status: 400})
        }

        //notify added user
        pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', {})

        await db.sadd(`user:${session.user.id}:friends`, idToAdd)

        await db.sadd(`user:${idToAdd}:friends`, session.user.id)

        // await db.srem(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)

        return new Response('OK')
    }catch (err){
        if (err instanceof z.ZodError){
            return new Response('Invalid request payload', {status: 422})
        }

        return new Response('Invalid Request', {status: 400})
    }
}