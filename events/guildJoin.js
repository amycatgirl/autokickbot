import { knex } from "../database/postgres.js"
import { Log } from "../utilities/log.js"

const artificialDelay = (amount) => new Promise((res) => { setTimeout(() => res(), amount * 1000) })

/**
 * @param {number} maxTries - Amount of tries to attempt
 * @param {import("revolt.js").Channel} channel - Channel to find messages in
 * @param [import("revolt.js").Member] member - Member to find
 * @returns {Promise<import("revolt.js").Message>}
 */
async function findLatestMessageFrom(
	maxTries,
	channel,
	member
) {
	let context;
	async function recurse(depth) {
		let result;
		if (depth >= maxTries) throw new Error(`Could not find user in channel after ${maxTries} tries.`)

		const messages = await channel.fetchMessages({ limit: 100, before: context })

		for (const message of messages) {
			if (message.member === member) {
				result = message;
				break;
			}
		}

		if (result) {
			return result;
		} else {
			await artificialDelay(5)

			try {
				const result = await recurse(depth + 1)
				return result
			} catch (error) {
				// bubble the error up!
				throw error
			}
		}

	}

	try {
		const result = await recurse(1)
		return result
	} catch (error) {
		// Bubble it even more!!!
		throw error
	}
}

/**
 * Action to perform when the bot joins a new server
 * @param {import("revolt.js").Server} guild
 */
async function guildJoin(guild) {
	Log.d("info", `Bot joined guild ${guild.name}`)
	// Create a new table with the id of the server as it's name
	await knex.schema.createTable(guild.id, (table) => {
		table.string('user', 26)
		table.timestamp('lastActive')
		table.unique(["user"])
	})

	// find the last activity of EACH member
	// if it couldn't find anything, set the timestamp to the join date
	// can be expensive but eh, whatever
	// it's not like large servers would use this bot... right???

	// TODO make proper logging function similar to android's Log class
	Log.d("info", "Finding every user's last activity!")

	const { _, members } = await guild.fetchMembers();
	// filter out channels the bot cannot see
	const channels = guild.channels.filter(channel => channel.orPermission("ViewChannel") && channel.type === "TextChannel")

	for await (const member of members) {
		Log.d("gjoin", `Checking Member ${member.user.username}`)
		if (member.user.bot) {
			Log.w("gjoin", "Member is a bot, skipping!")
			continue
		};

		// try 10 full scrolls, if the user can't be found, give up :)		
		for await (const channel of channels) {
			Log.d("gjoin", `Checking messages from ${member.user.username} in ${channel.name}`)
			try {
				const foundMessage = await findLatestMessageFrom(10, channel, member)
				Log.d("gjoin", "Found a message!")

				// upsert user
				await knex(guild.id).insert({
					user: member.user.id,
					lastActive: foundMessage.editedAt ?? foundMessage.createdAt
				}).onConflict("user").merge()

			} catch (error) {
				// catch it here :3
				Log.e("gjoin", error.message)	
				
				await knex(guild.id).insert({
					user: member.user.id,
					lastActive: member.joinedAt
				}).onConflict("user").merge()
				
				continue;
			}
		}
	}

}

export { guildJoin }
