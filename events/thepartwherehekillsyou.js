import { inspect } from "node:util";
import { Log } from "../utilities/log.js";
import { Client, Server } from "revolt.js";

/**
 * Can we kick this guy
 * @param {string} id - User ID
 * @param {Server} server - Target Server
 * @param {Client} ctx - Context client
 */
const canKick = async (id, server, ctx) => {
  const targetUser = await server.fetchMember(id);
  const self = await server.fetchMember(ctx.user.id);
  return (
    self.hasPermission(server, "KickMembers") &&
    targetUser.inferiorTo(self) &&
    server.ownerId !== targetUser.user.id
  );
};

/**
 * The actual autokicking part.
 *
 * Also known as the part where he kills you.
 *
 * @see https://www.youtube.com/watch?v=4dxTJC_LuuE
 *
 * TODO: allow servers to have their own config
 *
 * @async
 * @param {string} key - Key name (usually <server>:<user>)
 * @param {import("revolt.js").Client} ctx - Context/Client
 */
async function thisisthepartwherehekillsyou(key, ctx) {
  const [server, user, type] = key.split(":");

  // We are very sure that the server is on cache, unless
  // revolt.js shits it's pants again, which it probably will
  const targetServer = ctx.servers.get(server);
  Log.d(
    "tpwhky",
    "Attempting to kick user with ID of " + user + " from " + targetServer.name
  );
  const dmChannelWithUser = await ctx.users.get(user).openDM();
  switch (type) {
    case "w":
      await dmChannelWithUser.sendMessage({
        embeds: [
          {
            title: `You are about to get kicked from ${targetServer.name}`,
            description:
              `${targetServer.name} needs you to be active in order to remain there. Send at the very least one message and continue chatting with others in ${targetServer.name}!`,
          },
        ],
      });
      Log.d("tpwhky", "Succesfully warned user!");
      break;

    case "k":
      if (await canKick(user, targetServer, ctx)) {
        await dmChannelWithUser.sendMessage({
          embeds: [
            {
              title: `You have been kicked from ${targetServer.name} for inactivity`,
              description:
                "Do not worry, you can still join back by looking the server up on [Revolt Discover](</discover>) or by asking a friend for an invite back in.",
            },
          ],
        });

        await targetServer.kickUser(user);
      } else {
        Log.w("tpwhky", "We can't kick this user, skipping!");
      }
      break;
  }
}

export { thisisthepartwherehekillsyou };
