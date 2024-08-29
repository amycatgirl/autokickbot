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
 * AK command, can be registered via the command handler class
 * @implements {Command}
 */
class Command {
	constructor() {
		this.name = ""
		this.description = null
		this.requiredArguments = null
	}

	async execute() {}
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
	 * @param {Command} Command - Command to register
	 */
	register(command) {
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

export { CommandHandler } 
