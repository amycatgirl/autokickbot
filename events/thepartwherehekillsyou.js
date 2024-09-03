import { Server, knex } from "../database/index.js"
import { inspect } from "node:util"
import { Log } from "../utilities/log.js"
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
		Log.d("kill", "It's voring time :3")
		for (const server of ctx.servers.values()) {
			if (!server.havePermission("KickMembers")) {
				Log.w("kill", "I did not have the permission to kick users, skipping this server...")
				continue;
			}
			const currentServerConfig = await knex("config").first().where({ server: server.id })

			const inactiveUsers = await knex(server.id)
				.where('lastActive', '<', knex.raw(`NOW() - INTERVAL '${currentServerConfig.maxInactivePeriod}'`))
				.select()
				.map(row => row.user);

			if (!inactiveUsers || inactiveUsers.length === 0) {
				Log.d("kill", `There are no members to kick in ${server.name}. Skipping!`)
				continue;
			}

			for (const user of inactiveUsers) {
				const fetchedUser = await ctx.users.fetch(user)
				const fetchedMember = await server.fetchMember(fetchedUser)
				const self = await server.fetchMember(ctx.user)

				if (!fetchedMember.inferiorTo(self)) {
					Log.w("kill", "I can't kick this user! My role is inferior to them, skipping!")
					continue;
				}

				Log.d("kill", "Attempting to kick this user: " + inspect(fetchedUser))

				const dms = await fetchedUser.openDM()
				await dms.sendMessage({
					embeds: [
						{
							title: `Kicked from ${server.name} for inactivity`,
							description: `You have been from ${server.name} kicked for inactivity. If you wish to continue being inside the server, rejoin it via discover or via an invite link.`
						}
					]
				})
				await server.kickUser(user)

				// Remove user from db.
				await Server(server.id).where("user", user).del()

				Log.d("kill", "User kicked! Next!")
			}
		}
		
		Log.d("kill", "Done checking all servers. Sleeping...")
	}, 60000)
}

export { thisisthepartwherehekillsyou }
