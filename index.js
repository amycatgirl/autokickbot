//@ts-check
import dayjs from "dayjs"
import DurationPlugin from "dayjs/plugin/duration.js"
import RelativeTime from "dayjs/plugin/relativeTime.js"

import "dotenv/config"
import { Client } from "revolt.js"

import fs from "node:fs"

import { CommandHandler } from "./commands/index.js"
import { pub, sub } from "./database/redis.js"
import { guildJoin, guildLeave, memberJoin, memberLeave, messageSend, syncConfig, thisisthepartwherehekillsyou } from "./events/index.js"
import { Log } from "./utilities/log.js"
import { knex } from "./database/postgres.js"

// extend dayjs here
dayjs.extend(RelativeTime)
dayjs.extend(DurationPlugin)

const client = new Client()
const commandHandler = new CommandHandler()
/**
 * @prop {string} AK_TOKEN - Bot Token
 * @prop {string} AK_PREFIX - Bot Prefix
 */
const { AK_TOKEN, AK_PREFIX } = process.env

async function registerCommands() {
	const commandFolders = fs.readdirSync('./commands');
	for (const element of commandFolders) {
		if (fs.lstatSync(`./commands/${element}`).isDirectory()) {
			const commandFiles = fs.readdirSync(`./commands/${element}`).filter(file => file.endsWith(".js"));
			for (const file of commandFiles) {
				const { default: command } = await import(`./commands/${element}/${file}`)

				commandHandler.register(new command())
			}
		} else {
			continue
		}
	}

	Log.d("handler", "Registered " + commandHandler.list.length + " commands") 
}

sub.pSubscribe("__keyevent@0__:expired", async (message) => {
	await thisisthepartwherehekillsyou(message, client)
})

client.once("ready", () => {
	Log.d("bot", "Ready!")
	Log.d("bot", `Logged in as ${client.user?.username}. Watching ${Array.from(client.servers.values()).length} servers.`)
})

client.once("ready", async () => syncConfig())

// TODO make this a bit cleaner maybe?
// is it even necesary though
client.on("packet", async p => p.type === "ServerCreate" && await guildJoin(p, client))
client.on("server/delete", async s => await guildLeave(s))
client.on("message", async m => await messageSend(m))
client.on("member/join", async m => await memberJoin(m))
client.on("member/leave", async m => await memberLeave(m))

client.on("message", async (message) => {
	if (
		message.author?.bot ||
		message.author?._id === client.user?._id ||
		!message.content ||
		!message.content.startsWith(AK_PREFIX ?? "ak!")
	) return

	const args = message.content
		.trim()
		.substring((AK_PREFIX ?? "ak!").length)
		.split(/ +/g)

	const requestedCommand = args?.shift()

	if (!requestedCommand) return;

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

		const result = await command.execute(args, message)

		if (result) {
			await message.reply(result)
		}
	} catch (error) {
		await message.reply(`\`\`\`js\n${await error}\n\`\`\``)

		console.error(error)
	}
})

// Make sure commands are registered *before* the bot starts.
registerCommands().then(() => {
	if (!AK_TOKEN) throw new Error("Missing token!")
	client.loginBot(AK_TOKEN)
})

process.on('SIGINT', async () => {
	// Clean up all connections safely
	await pub.quit();
	await sub.quit();

	await knex.destroy()
});
