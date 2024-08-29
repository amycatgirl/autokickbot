/**
 * @param {import("revolt.js").Message} message
 */
function messageSend(message) {
	console.log("New message!")
	if (message.author.bot || message.systemMessage || !message.author) return // Exclude bot users from the action
}

export { messageSend } 
