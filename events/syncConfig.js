import { knex } from "../database/postgres.js"
import { Log } from "../utilities/log.js"

/**
 * @param {import("revolt.js").Server[]}
 */
async function syncConfig(servers) {
	await knex.schema.createTable("config", (table) => {
		table.string("server", 26)
		table.string("maxInactivePeriod") // NOTE: https://www.postgresql.org/docs/8.2/datatype-datetime.html
		table.unique(["server"])
	}).catch(() => {})

	for await (const server of servers) {
		const result = await knex("config").insert({
			server: server.id,
			maxInactivePeriod: "1 weeks"
		}).onConflict("server").ignore().returning(["server", "maxInactivePeriod"])

		Log.d("sync", `Synced config for server ${server.name}. Result: ${result}`)
	}
}

export { syncConfig }
