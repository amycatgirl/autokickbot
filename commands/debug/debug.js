import { Command } from "../index.js"
import { Log } from "../../utilities/log.js"
import { migrateKeysToNewTTL } from "../../database/redis.js"

class DebugCommand extends Command {
	constructor() {
		super()

		this.name = "debug"
		this.description = "Developer only command"
		this.dev = true

		this.requiredArguments = 1
		this.usage = "debug <debugFunction>"
	}

	async execute(args, ctx) {
		switch(args[0]) {
			case "migrateRedisKeys":
				const type = args[1]
				const oldValue = args[2]
				const newValue = args[3]

				Log.d("debug", `${type} ${oldValue} ${newValue}`)

				const result = await migrateKeysToNewTTL(ctx.channel.server._id, type, { oldValue, newValue })

				return `Migrated ${result} keys successfully!`
			default:
				throw `Usage: ${this.usage}` 
		}
	}
}

export default DebugCommand
