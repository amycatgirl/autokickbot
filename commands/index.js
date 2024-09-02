import { Log } from "../utilities/log.js"
/**
 * @interface Command
 * @prop {string} name - Command name
 * @prop {number} [argumentAmount] - Amount of required arguments
 * @prop {string} [description] - Command description
 * @prop {string} [usage] - How the command should be used
 */

/**
 *
 * Execute a command asynchronously
 *
 * @async
 * @function
 * @name Command#execute
 * @param {string[]} args - Arguments to pass to the command
 * @param {import("revolt.js").Message} ctx - Context
 * @returns {Promise<string | void>}
 */

/**
 * Check if the command has the minimum amount of arguments required
 * @function
 * @name Command#checkArguments
 * @param {string[]} args - Arguments that will be passed to the command
 */


/**
 * AK command, can be registered via the command handler class
 * @implements {Command}
 */
class Command {
	constructor() {
		this.name = ""
		this.description = null
		this.usage = null
		this.requiredArguments = null
	}

	async execute() {}

	checkArguments(args) {
		if (args.length < this.requiredArguments ?? 0) throw new Error(`You are missing ${this.requiredArguments - args.length} arguments.`)
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
	 * @returns {Command}
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
