import { knex } from "../database/postgres.js"
import { Log } from "../utilities/log.js"

async function syncConfig() {
	Log.d("db", "Migrating database...")
	await knex.migrate.latest()	

	Log.d("db", "Migration complete!")
}

export { syncConfig }
