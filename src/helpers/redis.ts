const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN


type Command = 'zrange' | 'sismember' |'get' | 'smembers'

export async function FetchRedis(
    command:Command,
    ...args: (string | number)[]
    ) {
    const commandUrl = `${upstashRedisUrl}/${command}/${args.join('/')}`

    const response = await fetch(commandUrl, {
            headers: {
                Authorization: `Bearer ${authToken}`
            },
            cache: 'no-store',
        })

    if (!response.ok){
        throw new Error(`Error executing redis Commad: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
}