import { Server, knex } from "../database/index.js"
import { inspect } from "node:util"
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
		console.log("[INFO] It's voring time :3")
		for (const server of ctx.servers.values()) {
			if (!server.havePermission("KickMembers")) {
				console.warn("[WARN] I did not have the permission to kick users, skipping this server...")
				continue;
			}

			const inactiveUsers = await Server(server.id)
				.where('lastActive', '<', knex.raw('NOW() - INTERVAL \'1 week\''))
				.select('user').then(rows => rows.map(row => row.user));
			console.log("INACTIVE USERS: " + inspect(inactiveUsers))

			if (!inactiveUsers) {
				console.log("[INFO] There are no members to kick. Awesome!")
				continue;
			}

			for (const user of inactiveUsers) {
				const fetchedUser = await ctx.users.fetch(user)
				const fetchedMember = await server.fetchMember(fetchedUser)
				const self = await server.fetchMember(ctx.user)

				if (!fetchedMember.inferiorTo(self)) {
					console.log("[INFO] I can't kick this user! My role is inferior to them, skipping!")
					continue;
				}

				console.log("[INFO] Attempting to kick this user: " + inspect(fetchedUser))

				const dms = await fetchedUser.openDM()
				await dms.sendMessage({
					embeds: [
						{
							title: `AK - Kicked from ${server.name} for inactivity`,
							description: `You have been from ${server.name} kicked for inactivity. If you wish to continue being inside the server, rejoin it via discover or via an invite link.`
						}
					]
				})
				await server.kickUser(user)

				// Remove user from db.
				await Server(server.id).where("user", user).del()

				console.log("[INFO] Kicked! Next!")
			}
		}
	}, 60000)
}

export { thisisthepartwherehekillsyou }
