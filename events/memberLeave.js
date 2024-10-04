import { pub } from "../database/redis.js"
import { getKeys } from "../utilities/pubScan.js"
/**
 * Remove redis kv of hydrated member
 * @param {import("revolt.js").ServerMember} member 
 */
async function memberLeave(member) {
    const keys = await getKeys(`${member.server.id}:${member.user.id}:*`)

    for (const key of keys) {
        await pub.del(key)
    }
}

export default memberLeave