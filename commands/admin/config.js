import { Command } from "../index.js"
import { knex } from "../../database/index.js"
import { inspect } from "node:util"
/**
 * @implements {import("../index.js").Command}
 */
class ConfigCommand extends Command {
	constructor() {
		super();

		this.name = "config",
		this.description = "Configure server options such as timeouts and messages.",
		this.requiredArguments = 1 // format is <get|set|entries> [config_name] [value]
		this.usage = "config <get|set|entries> [key] [value]"
 		/** @type {(keyof typeof import("revolt.js").Permission)[]}*/
		this.requiredPermissions = ["ManageServer"]
	}

	/**
	 * @param {string[]} args
	 * @param {import("revolt.js").Message} ctx
	 * @returns {Promise<string | void>}
	 */
	async execute(args, ctx) {
		const currentServerConfig = await knex("config").first().where({ server: ctx.server.id })
		
		if (!currentServerConfig) throw new Error("Something went very wrong! Missing server configuration.")
		
		switch(args[0].toLowerCase()) {
			case "get":
				return currentServerConfig[args[1]] ?? "Key not found, use `entries` to see which keys are valid."
				
			case "set":
				const value = args.slice(2).join(" ")
				if (!args[1] in currentServerConfig) return "Key not found, use `entries` to see which keys are valid."
				const changed = await knex("config").update({ [args[1]]: value }).returning(args[1]).where({ server: ctx.server.id })

				return `Changed key \`${args[1]}\` successfully!\nChanges:\n\`\`\`js\n${inspect(changed)}\n\`\`\``
			case "entries":
				return Object.entries(currentServerConfig).map(([key, value]) => `\`${key}\` -> \`${value}\`\n`).join("")
			default:
				throw new Error(`Does not match format of ${this.usage}`)
		}
	}
}

export default ConfigCommand
