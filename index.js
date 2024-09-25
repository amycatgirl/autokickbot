import dayjs from "dayjs"
import DurationPlugin from "dayjs/plugin/duration.js"
import "dotenv/config"
import { Client } from "revolt.js"

import fs from "node:fs"

import { CommandHandler } from "./commands/index.js"
import { pub, sub } from "./database/redis.js"
import { guildJoin, guildLeave, messageSend, syncConfig, thisisthepartwherehekillsyou } from "./events/index.js"
import { Log } from "./utilities/log.js"

// extend dayjs here
dayjs.extend(DurationPlugin)

const client = new Client()
const commandHandler = new CommandHandler()
const { AK_TOKEN, AK_PREFIX } = process.env

async function registerCommands() {
	const commandFolders = fs.readdirSync('./commands');
	for (const element of commandFolders) {
		if (fs.lstatSync(`./commands/${element}`).isDirectory()) {
			const commandFiles = fs.readdirSync(`./commands/${element}`).filter(file => file.endsWith(".js"));
			for (const file of commandFiles) {
				/** @type {{ default: import("./commands").Command }} */
				const { default: command } = await import(`./commands/${element}/${file}`)

				commandHandler.register(new command())
			}
		} else {
			continue
		}
	}

	Log.d("handler", "Registered " + commandHandler.list.length + " commands") 
}

sub.pSubscribe("__keyevent@0__:expired", async (message, pattern) => {
	await thisisthepartwherehekillsyou(message, client)
})

client.once("ready", () => {
	Log.d("bot", "Ready!")
	Log.d("bot", `Logged in as ${client.user.username}. Watching ${client.servers.size()} servers.`)
})

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
		command.checkPermissionsAgainstCallee(message.member)

		const result = await command.execute(message)

		if (result) {
			await message.reply(result)
		}
	} catch (error) {
		await message.reply(`\`\`\`js\n${await error}\n\`\`\``)

		console.error(error)
	}
})

// Make sure commands are registered *before* the bot starts.
registerCommands().then(() => client.loginBot(AK_TOKEN))

process.on('SIGINT', async () => {
	// Clean up the connection safely
	await pub.quit();
	await sub.quit();
});
