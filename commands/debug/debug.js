import { Command } from "../index.js"
import { inspect } from "node:util"

const clean = async (text, ctx) => {
	// If our input is a promise, await it before continuing
	if (text && text.constructor.name == "Promise")
	  text = await text;

	// If the response isn't a string, `util.inspect()`
	// is used to 'stringify' the code in a safe way that
	// won't error out on objects with circular references
	// (like Collections, for example)
	if (typeof text !== "string") {
	  if (typeof text === "object" && "client" in text) delete text["client"]
	  text = inspect(text, { depth: 1 });
	}
	// Replace symbols with character code alternatives
	text = text
	  .replace(/`/g, "`" + String.fromCharCode(8203))
	  .replace(/@/g, "@" + String.fromCharCode(8203))
	  .replaceAll(ctx.session.token, "[REDACTED]");

	// Send off the cleaned up result
	return text;
}
class DebugCommand extends Command {
	constructor() {
		super()
		this.name = "eval"
		this.usage = "eval <javascript_code>"

		this.description = "Evaluate javascript code (OWNER ONLY)"

		this.requiredArguments = 1
		this.requiredPermissions = [ "ManageServer" ]
	}


	/**
	 * @param {string[]} args
	 * @returns {string | void}
	 */
	async execute(args, ctx) {
		const evaled = eval(args.join(" "))
		const cleaned = await clean(evaled, ctx.client)
		return `\`\`\`js\n${cleaned}\n\`\`\``
	}
}

export default DebugCommand
