import { Command } from "../index.js"
import { guildJoin } from "../../events/index.js"

class RegenerateGuildTimeoutListCommand extends Command {
	constructor() {
		super()
		this.name = "regenerateTimeoutList"
		this.description = "Debug command"

		this.requiredPermissions = ["ManageServer"]
	}

	async execute(_, ctx) {
		await guildJoin({ server: { _id: ctx.channel.server._id } }, ctx.client, true)

		return "DONE!"
	}
}

export default RegenerateGuildTimeoutListCommand
