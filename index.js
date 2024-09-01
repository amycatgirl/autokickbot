import "dotenv/config"

import fs from "node:fs"

import { Client } from "revolt.js"
import { CommandHandler } from "./commands/index.js"
import { guildJoin, guildLeave, messageSend } from "./events/index.js"
import { Server, knex } from "./database/index.js"

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
				
				console.log(command)

				commandHandler.register(new command())
			}
		} else {
			continue
		}
	}

	console.info("[INFO] Registered " + commandHandler.list.length + " commands") 
}



client.once("ready", () => {
	console.log("Ready!")
	console.info(`Logged in as ${client.user.username}. Watching ${client.servers.size()} servers.`)

	// TODO decouple logic
	setInterval(async () => {
		for (const server of client.servers.values()) {
			const inactiveUsers = await Server(server.id)
				.where('lastActive', '<', knex.raw('NOW() - INTERVAL \'1 week\''))
				.select('user');
			if (!inactiveUsers) continue;

			for (const user of inactiveUsers) {
				const dms = await client.users.get(user).openDM()
				await dms.sendMessage({
					embeds: [
						{
							title: "AK - Kicked for inactivity",
							description: "You have been kicked for inactivity. If you wish to continue being inside the server, rejoin it via discover."
						}
					]
				})
				await server.kickUser(user)
			}
		}
	}, 60000)
})

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
	console.info(`[INFO] Trying to find ${requestedCommand} in CommandHandler...`)
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
