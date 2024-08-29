import { knex } from "../database/index.js"

/**
 * Action to perform when the bot joins a new server
 * @param {import("revolt.js").Server} guild
 */
async function guildJoin(guild) {
	console.log("Bot joined guild ", guild.name)
	// Create a new table with the id of the server as it's name
	await knex.schema.createTable(guild.id, (table) => {
		table.string('user', 26)
		table.timestamp('lastActive')
	})
}

export { guildJoin }
