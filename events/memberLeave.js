import { pub } from "../database/redis.js"
import { getKeys } from "../utilities/pubScan.js"
/**
 * @typedef {Object} MemberInfo
 * @prop {string} user - ID of user
 * @prop {string} server - Server ID of Member
 */

/**
 * Remove redis kv of hydrated member
 * @param {MemberInfo} member 
 */
async function memberLeave(member) {
    const keys = await getKeys(`${member.server}:${member.user}:*`)

    const batch = pub.multi()


    for (const key of keys) {
	batch.del(key)
    }

    await batch.exec()
}

export default memberLeave
