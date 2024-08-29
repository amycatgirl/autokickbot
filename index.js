import "dotenv/config"

import { Client } from "revolt.js"
import { CommandHandler } from "./commands/index.js"
import { guildJoin, guildLeave, messageSend } from "./events/index.js"
import { Server } from "./database/index.js"

const client = new Client()
const commandHandler = new CommandHandler()
const { AK_TOKEN, AK_PREFIX } = process.env

client.once("ready", () => {
	console.log("Ready!")
	console.info(`Logged in as ${client.user.username}. Watching ${client.servers.size()} servers.`)

	// TODO decouple logic
	setTimeout(async () => {
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

client.on("messageCreate", (message) => {
	if (
		message.author.bot ||
		message.author.id === client.user.id ||
		!message.content ||
		!message.content.startsWith(AK_PREFIX)
	) return

	const args = message.content
		.trim()
		.substring(AK_PREFIX.length)
		.split(/  +/g)

	const command = args?.shift()

	if (command === "test") {
		message.reply("hello world!")
	}
})


client.loginBot(AK_TOKEN)
