//@ts-check
import {knex} from "../database/postgres.js";
import {Log} from "../utilities/log.js";
import {pub} from "../database/redis.js";
import {canKick} from "../utilities/canKick.js";
import dayjs from "dayjs";
import {fetchWithRateLimit} from "../utilities/fetchWithRateLimit.js";

/**
 * @param {number} maxTries - Amount of tries to attempt
 * @param {import("revolt.js").Channel} channel - Channel to find messages in
 * @param {import("revolt.js").Member} [member] - Member to find
 * @returns {Promise<import("revolt.js").Message>}
 */
async function findLatestMessageFrom(maxTries, channel, member) {
    /** @type {string | undefined} */
    let context;

    /**
     * @param {number} depth
     * @returns {Promise<import("revolt.js").Message>}
     */
    async function recurse(depth) {
        let result;
        if (depth >= maxTries)
            throw new Error(
                `Could not find user in channel after ${maxTries} tries.`
            );

        const messages = await fetchWithRateLimit(channel, {
            limit: 100,
            before: context,
        });

        for (const message of messages) {
            if (message.member._id === member._id) {
                Log.d("findLatest", "found message!")
                result = message;
                break;
            }
        }

        if (result) {
            return result;
        } else {
            try {
                Log.d("findLatest", `About to set context ${messages[messages.length - 1]?._id}`)
                context = messages[messages.length - 1]?._id;
                Log.d("findLatest", `Got new context ${context}`)
                return await recurse(depth + 1);
            } catch (error) {
                // bubble the error up!
                throw error;
            }
        }
    }

    try {
        return await recurse(1);
    } catch (error) {
        // Bubble it even more!!!
        throw error;
    }
}

/**
 * Action to perform when the bot joins a new server
 * @param {Extract<import("revolt.js").ClientboundNotification, { type: "ServerCreate" }>} packet
 * @param {import("revolt.js").Client} context
 * @param {boolean} isFromCommand=false
 */
async function guildJoin(packet, context, isFromCommand = false) {
    // find the last activity of EACH member
    // if it couldn't find anything, set the timestamp to the join date
    // can be expensive but eh, whatever
    // it's not like large servers would use this bot... right???

    if (!isFromCommand)
        await knex("config")
            .insert({
                server: packet.server._id,
                maxInactivePeriod: "1 weeks",
                minInactivePeriod: "3 days",
                warnPeriod: "3 days",
                calculateWarnPeriod: true,
            })
            .onConflict("server")
            .ignore()
            .returning(["server", "maxInactivePeriod"]);

    /** @type {import("revolt.js").Server} */
    const server =
        context.servers.get(packet.server._id) ??
        (await context.servers.fetch(packet.server._id));

    Log.d("info", "Finding every user's last activity!");

    const {members} = await server.fetchMembers();
    // filter out channels the bot cannot see
    const channels = server.channels.filter(
        (channel) =>
            channel?.havePermission("ViewChannel") &&
            channel.channel_type === "TextChannel"
    );

    for await (const member of members) {

        Log.d("gjoin", `Checking Member ${member.user.username}`);
        if (!await canKick(member._id.user, member.server, member.client)) {
            Log.d("gjoin", "Not setting keys of unkickable member, skipping!")
            continue;
        }

        /** @type {{ message_id: string, timestamp: number}[] } */
        const messageTimestamps = [];
        // try 10 full scrolls, if the user can't be found, give up :)
        for await (const channel of channels) {
            Log.d(
                "gjoin",
                `Checking messages from ${member.user.username} in ${channel?.name}`
            );
            try {
                if (!channel) continue;
                const foundMessage = await findLatestMessageFrom(5, channel, member);
                Log.d("gjoin", `Found a message! ID: ${foundMessage._id}`);

                messageTimestamps.push({
                    message_id: foundMessage._id,
                    timestamp: foundMessage.edited.getTime() || foundMessage.createdAt
                })

            } catch (error) {
                // catch it here :3
                Log.e("gjoin", error);
            }
        }

        if (messageTimestamps.length !== 0) {
            messageTimestamps.sort((a, b) => a.timestamp - b.timestamp)

            Log.d("gjoin", `Most recent message ${messageTimestamps.at(0)}`)

            const kickExpiry = Math.floor(
                dayjs
                    // @ts-expect-error extended.
                    .duration(
                        dayjs(messageTimestamps[0].timestamp)
                            .add(1, "week")
                            .diff(dayjs())
                    )
                    .as("seconds")
            );

            const warnExpiry = Math.floor(kickExpiry / 2);

            const kickKey = `${packet.server._id}:${member.user._id}:k`; // k stands for kick user
            const warnKey = `${packet.server._id}:${member.user._id}:w`; // w stands for warn user

            console.log(kickExpiry);

            await pub.set(kickKey, messageTimestamps[0].message_id, "EX", kickExpiry);
            await pub.set(warnKey, messageTimestamps[0].message_id, "EX", warnExpiry);

            return
        }

        const kickExpiry = Math.floor(
            dayjs
                // @ts-expect-error extended.
                .duration(
                    dayjs()
                        .add(1, "week")
                        .diff(dayjs())
                )
                .as("seconds")
        );

        const warnExpiry = Math.floor(kickExpiry / 2);

        const kickKey = `${packet.server._id}:${member.user._id}:k`; // k stands for kick user
        const warnKey = `${packet.server._id}:${member.user._id}:w`; // w stands for warn user

        console.log(kickExpiry);

        await pub.set(kickKey, "0".repeat(26), "EX", kickExpiry);
        await pub.set(warnKey, "0".repeat(26), "EX", warnExpiry);
    }
}

export {guildJoin};
