import { FetchRedis } from "./redis"

export const getFriendsByUserId= async (userId: string) =>{
    //retrieve friends of cuurent user
    const friendIds = await FetchRedis(
        'smembers',
        `user:${userId}:friends`
        ) as string[]

    const friends = await Promise.all(
        friendIds.map(async (friendId)=>{
            const friend = await FetchRedis('get', `user:${friendId}`) as string
            
            const parsedFriend = JSON.parse(friend) as User

            return parsedFriend 
        })
    )

    return friends
}