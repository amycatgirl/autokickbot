import { Server } from "../database/index.js"
/**
 * @param {import("revolt.js").Message} message
 */
async function messageSend(message) {
	console.log("New message!")
	if (message.author.bot || !message.server || message.systemMessage || !message.author) return // Exclude bot users from the action

	// check if the user is already in the database
	const user = await Server(message.server.id).where('user', message.author.id).first("user", "lastActive")

	if (!user) {
		await Server(message.server.id).insert({
			user: message.author.id,
			lastActive: message.createdAt
		})
	} else {
		console.log(user)
		await Server(message.server.id).where("user", message.author.id).update({
			lastActive: message.createdAt
		})

	}
}

export { messageSend } 
