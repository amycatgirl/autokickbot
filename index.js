import "dotenv/config"

import fs from "node:fs"

import { Client } from "revolt.js"
import { CommandHandler } from "./commands/index.js"
import { guildJoin, guildLeave, messageSend, thisisthepartwherehekillsyou, syncConfig } from "./events/index.js"
import { Log } from "./utilities/log.js"

const client = new Client()
const commandHandler = new CommandHandler()
const { AK_TOKEN, AK_PREFIX } = process.env

async function registerCommands() {
	const commandFolders = fs.readdirSync('./commands');
	for (const element of commandFolders) {
		if (fs.lstatSync(`./commands/${element}`).isDirectory()) {
			const commandFiles = fs.readdirSync(`./commands/${element}`).filter(file => file.endsWith(".js"));
			for (const file of commandFiles) {
				/** @type {import("./commands").Command} */
				const { default: command} = await import(`./commands/${element}/${file}`)

				commandHandler.register(new command())
			}
		} else {
			continue
		}
	}

	Log.d("handler", "Registered " + commandHandler.list.length + " commands") 
}



client.once("ready", () => {
	Log.d("bot", "Ready!")
	Log.d("bot", `Logged in as ${client.user.username}. Watching ${client.servers.size()} servers.`)
})

client.once("ready", () => thisisthepartwherehekillsyou(client))
client.once("ready", async () => syncConfig(Array.from(client.servers.values())))

// TODO make this a bit cleaner maybe?
// is it even necesary though
client.on("serverCreate", async s => await guildJoin(s))
client.on("serverLeave", async s => await guildLeave(s))
client.on("messageCreate", async s => await messageSend(s))

client.on("messageCreate", async (message) => {
	if (
		message.author.bot ||
		message.author.id === client.user.id ||
		!message.content ||
		!message.content.startsWith(AK_PREFIX)
	) return

	const args = message.content
		.trim()
		.substring(AK_PREFIX.length)
		.split(/ +/g)

	const requestedCommand = args?.shift()

	if (requestedCommand === "help") {
		message.reply(commandHandler.list.map(c => `${c.name} - ${c.description}\n`).join(""))
		return;
	}
	Log.d("bot", `Trying to find ${requestedCommand} in CommandHandler...`)
	const command = commandHandler.find(requestedCommand)

	if (!command) return message.reply("Command not found")

	try {
		command.checkArguments(args)
		const result = await command.execute(args, message)

		if (result) {
			await message.reply(result)
		}
	} catch (error) {
		await message.reply(`\`\`\`js\n${await error}\n\`\`\``)
	}
})

// Make sure commands are registered *before* the bot starts.
registerCommands().then(() => client.loginBot(AK_TOKEN))
