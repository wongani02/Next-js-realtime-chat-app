import { FetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import {z } from 'zod'

export async function POST(req: Request){
    try{
        const body = await req.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        const idToAdd = await FetchRedis('get', `user:email:${emailToAdd}`) as string
        console.log(idToAdd)

        // const RESTResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email${emailToAdd}`, {
        //     headers: {
        //         Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        //     },
        //     cache: 'no-store',
        // })

        // const data = await RESTResponse.json() as {result: string}
        
        // const idToAdd = data.result

        if(!idToAdd){
            return new Response('This person does not exist', {status: 400})
        }

        const session = await getServerSession(authOptions)

        if (!session){
            return new Response('Unauthorised', {status: 401})
        }

        if (idToAdd === session.user.id) {
            return new Response('You can not add yourself as a friend.', {status: 400})
        }

        //check if user is already added
        const isAlreadyAdded = await FetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1

        if (isAlreadyAdded){
            return new Response('Already Added this user', {status: 400})
        }


        //check if user is already friends
        const isAlreadyFriends = await FetchRedis('sismember', `user:${idToAdd}:friends`, idToAdd) as 0 | 1

        if (isAlreadyFriends){
            return new Response('Already friends with this user', {status: 400})
        }

        pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming_friend_requests`), 'incoming_friend_requests', {
            senderId: session.user.id,
            senderemail: session.user.email,
        })

        //valid request handler
        const request = await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        if (request){
            return new Response('request Sent')
        }

        return new Response('ok')

    }catch (err){
        if (err instanceof z.ZodError){
            return new Response('invalid request payload', {status: 422})
        }
        console.log(err)
        return new Response('error in the server', {status: 400})
    }
}