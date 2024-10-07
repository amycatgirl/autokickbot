import { Command } from "../index.js"
import { guildJoin } from "../../events/index.js"

class RegenerateCommand extends Command {
	constructor() {
		super()
		this.name = "regenerate"
		this.description = "Debug command"
		this.usage = "regenerate <what> [other arguments]"

		this.requiredArguments = 1

		this.requiredPermissions = ["ManageServer"]
	}

	async execute(args, ctx) {
		const [what, ...other] = args

		switch (what) {
			case "redisKeys":
				await guildJoin({ server: { _id: ctx.channel.server._id } }, ctx.client, true)
				return "Done regenerating redis keys for this server!";
			case "list":
				return "Available options:\n- redisKeys"
			default:
				throw `Usage: ${this.usage}`
		}
	}
}

export default RegenerateCommand
