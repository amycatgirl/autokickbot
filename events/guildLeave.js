import { knex } from "../database/postgres.js"
import { pub } from "../database/redis.js"
import { Log } from "../utilities/log.js"
import { getKeys } from "../utilities/pubScan.js"
/**
 * Action to perform when the bot leaves a server
 * @param {string} guild
 */
async function guildLeave(guild) {
	Log.d("info", `Bot left guild with id of ${guild}, dropping it's table`)
	await knex("config").where({ server: guild }).select("*").delete()

	const keys = await getKeys(`${guild}:*`)
	
	const batch = pub.multi()
	

	for (const key of keys) {
		batch.del(key)
	}

	await batch.exec()
}

export { guildLeave }
