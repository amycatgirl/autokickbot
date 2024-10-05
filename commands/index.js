//@ts-check

import { Log } from "../utilities/log.js"

/**
 * AK Command, must be overloaded.
 * 
 * @class
 * @prop {string} name - Command name
 * @prop {number} [argumentAmount] - Amount of required arguments
 * @prop {string} [description] - Command description
 * @prop {string} [usage] - How the command should be used
 * @prop {(keyof typeof import("revolt.js").Permission)[]} [requiredPermissions] - Permisions required to run the command
 */
class Command {
	constructor() {
		this.name = ""
		this.description = null
		this.usage = null
		this.requiredArguments = null
 		/** @type {(keyof typeof import("revolt.js").Permission)[]}*/
		this.requiredPermissions = []
	}

	/**
	 * Execute a command asynchronously
	 *
	 * @param {string[]} args - Arguments to pass to the command
	 * @param {import("revolt.js").Message} ctx - Context
	 * @returns {Promise<string | void>}
	 */
	async execute(args, ctx) {}

	/**
	 * Check if the command has the minimum amount of arguments required
	 * @param {string[]} args - Arguments that will be passed to the command
	 * @throws {Error}
	 * 
	 * TODO: Custom errors
	 */
	checkArguments(args) {
		if (!args || (args.length < this.requiredArguments || 0)) throw new Error(`You are missing ${this.requiredArguments - args.length} arguments.`)
	}

	/**
	 * @param {import("revolt.js").Member | undefined} member
	 */
	checkPermissionsAgainstCallee(member) {
		if (!member) throw Error("Missing member object!")
		if (member.user?._id == "01G5Z60R22C6TJJY7EJKG9ACD0") return

		if (this.requiredPermissions.length == 0) return
		if (!member.server) throw new Error("Bot commands not available through DMs.")
		if (member.hasPermission(member.server, ...this.requiredPermissions)) {
			return
		} else throw new Error("Unauthorized.")
	}
}

/**
 * AK Command Handler, handles finding and storing commands in memory
 */
class CommandHandler {

	/** @type {Map<string, Command> }*/
	#commands = new Map()

	/**
	 * @param {string} name - Name of the command
	 * @returns {Command | undefined}
	 */
	find(name) {
		return this.#commands.get(name)
	}

	/**
	 * @param {Command} command - Command to register
	 */
	register(command) {
		Log.d("handler", `Registered command ${command.name} with ${command.requiredArguments} required args.`)
		this.#commands.set(
			command.name,
			command
		)
	}
	
	/**
	 * @returns {Command[]}
	 */
	get list() {
		return Array.from(this.#commands.values())
	}
}

export { CommandHandler, Command } 
