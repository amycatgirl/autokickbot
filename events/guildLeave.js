import { knex } from "../database/postgres.js"
import { Log } from "../utilities/log.js"
/**
 * Action to perform when the bot leaves a server
 * @param {import("revolt.js").Server} guild
 */
async function guildLeave(guild) {
	Log.d("info", `Bot left guild ${guild.name}, dropping it's table`)
	await knex.schema.dropTable(guild.id)
}

export { guildLeave }
