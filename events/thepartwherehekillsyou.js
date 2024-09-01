import { Server, knex } from "../database/index.js"

/**
 * The actual autokicking part.
 *
 * Also known as the part where he kills you.
 *
 * @see https://www.youtube.com/watch?v=4dxTJC_LuuE
 *
 * TODO: allow servers to have their own config
 * 
 * @param {import("revolt.js").Client} ctx - Context/Client
 */
function thisisthepartwherehekillsyou(ctx) {
	setInterval(async () => {
		for (const server of ctx.servers.values()) {
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

				// Remove user from db.
				await Server(server.id).where("user", user).del()
			}
		}
	}, 60000)
}

export { thisisthepartwherehekillsyou }
