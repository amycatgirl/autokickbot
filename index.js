import { Client } from "revolt.js"
import "dotenv/config"

const client = new Client()
const { AK_TOKEN, AK_PREFIX } = process.env

client.once("ready", () => {
	console.log("Ready!")
	console.info(`Logged in as ${client.user.username}. Watching ${client.servers.size()} servers.`)
})

client.on("messageCreate", (message) => {
	if (message.author.bot || message.author.id === client.user.id || !message.content || !message.content.startsWith(AK_PREFIX)) return

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
