import { Command } from "../index.js"

/**
 * @implements {import("../index.js").Command}
 */
class ConfigCommand extends Command {
	constructor() {
		super();

		this.name = "config",
		this.description = "Configure server options such as timeouts and messages.",
		this.requiredArguments = 1 // format is <get|set|entries> [config_name] [value]
	}

	async execute(args, ctx) {
		return "Hello! " + args.join(" ") 
	}
}

export default ConfigCommand
