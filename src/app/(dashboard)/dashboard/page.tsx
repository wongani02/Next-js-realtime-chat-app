import { getFriendsByUserId } from "@/helpers/get_friends_by_user";
import { FetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FunctionComponent } from "react";

interface DashboardProps {
    
}
 
const Dashboard = async ({}) => {

    const session = await getServerSession(authOptions)

    if (!session ) notFound()

    const friends = await getFriendsByUserId(session.user.id)

    const friendsWithLastMessage = await Promise.all(
        friends.map(async (friend)=>{
            const [rawlastMessage] = (await FetchRedis(
                'zrange',
                `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
                -1, 
                -1
            )) as string[]
            
            console.log('this is the raw last message', rawlastMessage)
            // if(rawlastMessage.length === undefined) return null
            
            const lastMessage = JSON.parse(rawlastMessage) as Message

            return {
                ...friend,
                lastMessage
            }
        })
    )

    return ( 
        <div className="container py-12">
            <h1 className="font-bold text-5xl mb-4">Recent Chats  </h1>
            {
                friendsWithLastMessage.length === 0 ? (
                    <p>No recent chats at the moment</p>
                ): friendsWithLastMessage.map((friend)=>(
                    <div 
                    key={friend?.id}
                    className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md">
                        <div className="absolute right-4 inset-y-0 flex items-center">
                            <ChevronRight className="h-7 w-7 text-zinc-400"/>
                        </div>
                        <Link 
                        className="relative sm:flex"
                        href={`/dashboard/chat/${chatHrefConstructor(session.user.id, friend.id)}`}>
                            <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                                <div className="relative h-6 w-6">
                                    <Image
                                    fill
                                    referrerPolicy="no-referrer"
                                    className="rounded-full"
                                    alt={`${friend?.name}  profile image`}
                                    src={friend.image}
                                    />
                                </div>
                            </div>
                            <div className="div">
                                <h4 className="text-lg font-semibold">{friend?.name}</h4>
                                <p className="mt-1 max-w-md">
                                    <span className="text-zinc-400">
                                        {friend?.lastMessage?.senderId === session.user.id ? 'You: ' : ''}
                                        {friend?.lastMessage.text}
                                    </span>
                                </p>
                            </div>
                        </Link>
                    </div>
                ))
            }
        </div>
     );
}
 
export default Dashboard;