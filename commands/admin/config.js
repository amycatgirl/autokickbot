import {Command} from "../index.js"
import {knex} from "../../database/postgres.js"
import {inspect} from "node:util"
import {migrateKeysToNewTTL} from "../../database/redis.js"
import dayjs from "dayjs"

/**
 * @implements {import("../index.js").Command}
 */
class ConfigCommand extends Command {
	constructor() {
		super();

		this.name = "config"
		this.description = "Configure server options such as timeouts and messages."
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
		const currentServerConfig = await knex("config").first().where({ server: ctx.channel.server._id })
		
		if (!currentServerConfig) throw new Error("Something went very wrong! Missing server configuration.")
		
		switch(args[0].toLowerCase()) {
			case "get":
				return currentServerConfig[args[1]] ?? "Key not found, use `entries` to see which keys are valid."
				
			case "set":
				const value = args.slice(2).join(" ")
				if (!args[1] in currentServerConfig) return "Key not found, use `entries` to see which keys are valid."
				let changedRedisKeys = 0;

				const changed = await knex("config").update({ [args[1]]: args[1] === "warnPeriod" ? value.toLowerCase() === "true" : value }).returning(args[1]).where({ server: ctx.channel.server._id })

				if (args[1] === "maxInactivePeriod" || args[1] === "minInactivePeriod") {
					const [newAmount, newUnit] = value.split(" ")
					const [oldAmount, oldUnit] = currentServerConfig[args[1]].split(" ")
					const oldDuration = dayjs.duration(oldAmount, oldUnit).asSeconds()
					const newDuration = dayjs.duration(newAmount, newUnit).asSeconds()

					changedRedisKeys = await migrateKeysToNewTTL(ctx.channel.server._id, "k", { oldValue: oldDuration, newValue: newDuration }) 

					if (currentServerConfig.calculateWarnPeriod){
						changedRedisKeys += await migrateKeysToNewTTL(ctx.channel.server._id, "w", { oldValue: oldDuration/2, newValue: newDuration/2 })
					}
				} else if (args[1] === "warnPeriod" && args[2] === "true" && !currentServerConfig.calculateWarnPeriod) {
					const [newAmount, newUnit] = value.split(" ")
					const [oldAmount, oldUnit] = currentServerConfig[args[1]].split(" ")
					const oldDuration = dayjs.duration(oldAmount, oldUnit).asSeconds()
					const newDuration = dayjs.duration(newAmount, newUnit).asSeconds()

					changedRedisKeys += await migrateKeysToNewTTL(ctx.channel.server._id, "w", { oldValue: oldDuration, newValue: newDuration })
				} 

				return `Changed key \`${args[1]}\` successfully!\nChanges:\n\`\`\`js\n${inspect(changed)}\n\`\`\`\nUpdated ${changedRedisKeys % 2 === 0 ? changedRedisKeys/2 : changedRedisKeys} members successfully!`
			case "entries":
				return Object.entries(currentServerConfig).map(([key, value]) => `\`${key}\` -> \`${value}\`\n`).join("")
			default:
				throw new Error(`Does not match format of ${this.usage}`)
		}
	}
}

export default ConfigCommand
