import "dotenv/config"
import "./database/index.js"

import { Client } from "revolt.js"
import { guildJoin, guildLeave, messageSend } from "./events/index.js"

const client = new Client()
const { AK_TOKEN, AK_PREFIX } = process.env

client.once("ready", () => {
	console.log("Ready!")
	console.info(`Logged in as ${client.user.username}. Watching ${client.servers.size()} servers.`)
})

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
