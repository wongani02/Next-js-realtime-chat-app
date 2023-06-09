import { FetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FunctionComponent } from "react";
import FriendRequests from "@/components/FriendRequests";

 
const page = async () => {

    const session = await getServerSession(authOptions)

    if(!session) notFound

    //get ids of people who sent frien requests
    const incomingSenderIds = (await FetchRedis('smembers', `user:${session?.user.id}:incoming_friend_requests`)) as string[]

    //get the emails of each respective user using their user id
    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) =>{
            const sender = await FetchRedis('get',
            `user:${senderId}`) as string
            
            const senderParsed = JSON.parse(sender) as User
            return {
                senderId,
                senderEmail: senderParsed.email,
            }
        })
    )

    return ( 
        <main className="mx-2 pt-8">
            <h1 className="font-bold text-2xl mb-8">Incoming Friend Requests</h1>
            <div className="flex flex-col gap-4">
                <FriendRequests
                incomingFriendRequests={incomingFriendRequests}
                sessionId={session?.user.id}
                />
            </div>
        </main>
     );
}
 
export default page;