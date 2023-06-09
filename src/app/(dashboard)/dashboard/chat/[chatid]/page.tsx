import { FetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FunctionComponent } from "react";
import Image from "next/image";
import Messages from "@/components/Messages";
import ChatInput from "@/components/ChatInput";


interface pageProps {
    params: {
        chatid: string
    }
}
 

async function getChatMessages(chatid: string) {
    try{
        const result: string[] = await FetchRedis(
            'zrange',
            `chat:${chatid}:messages`,
            0,
            -1,
        )
        console.log('here are the messages', result)

        const dbMessages = result.map((message)=>{
            return JSON.parse(message) as Message
        })

        console.log('db message isright here',dbMessages)

        const reverseDbMessages = dbMessages.reverse()

        const messages = messageArrayValidator.parse(reverseDbMessages)

        console.log(messages)

        return messages

    }catch (err){
        console.log(err)
        notFound()
    }
}

const page = async ({params}: pageProps) => {

    const { chatid }= params

    const session= await getServerSession(authOptions)

    if (!session) notFound()

    const {user} = session

    const [userId1, userId2] = chatid.split('--')

    if (user.id!==userId1 && user.id !==userId2){
        notFound()
    }

    const chatPartnerId = user.id === userId1 ? userId2 : userId1

    const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User

    const initialMessages = await getChatMessages(chatid)


    return ( 
        <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-2rem)]">
            <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
                <div className="relative flex items-center space-x-4">
                    <div className="relative">
                        <div className="relative w-8 h-8 sm:w-12 sm:h-12">
                            <Image
                            className="rounded-full ml-2"
                            fill
                            referrerPolicy="no-referrer"
                            src={chatPartner.image}
                            alt={`${chatPartner.name} profile picture`}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col leading-tight">
                        <div className="text-xl flex items-center">
                            <span className="tex-gray-700 mr-3 font-semibold">
                                {chatPartner.name}
                            </span>
                        </div>

                        <span className="text-sm text-gray-600">{chatPartner.email}</span>
                    </div>
                </div>
            </div>

            <Messages
            chatid={chatid}
            sessionId={session.user.id}
            initialMessages={initialMessages}
            chatPartner={chatPartner}
            sessionImg={session.user.image}
            />

            <ChatInput
            chatid={chatid}
            chatPartner={chatPartner}
            />
        </div>
     );
}
 
export default page;