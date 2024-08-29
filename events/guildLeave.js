import { knex } from "../database/index.js"

/**
 * Action to perform when the bot leaves a server
 * @param {import("revolt.js").Server} guild
 */
async function guildLeave(guild) {
	console.log("Bot left guild ", guild.name)
	await knex.schema.dropTable(guild.id)
}

export { guildLeave }
