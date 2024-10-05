// @ts-check
import { knex } from "../database/postgres.js";
import { Log } from "../utilities/log.js";
import { canKick } from "../utilities/canKick.js";
import dayjs from "dayjs";


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

  if (!targetServer) return

  const { maxInactivePeriod } = await knex("config").first().where({
    server,
  })

  const [amount, unit] = maxInactivePeriod.split(" ")

  // @ts-expect-error duration was extended on index.js
  let timeUntilKick = dayjs.duration(amount, unit)
  
  timeUntilKick = timeUntilKick.subtract(timeUntilKick.asSeconds() / 2, "s")


  Log.d(
    "tpwhky",
    "Attempting to kick user with ID of " + user + " from " + targetServer?.name
  );
  const dmChannelWithUser = await ctx.users.get(user)?.openDM();
  switch (type) {
    case "w":
      await dmChannelWithUser?.sendMessage({
        embeds: [
          {
            title: `You are about to get kicked from ${targetServer?.name}`,
            description:
              `Hello, this is ${targetServer?.name}. You have been inactive here for quite some time, and will be removed from the server if you do not send another message within ${timeUntilKick.humanize()}. We will not notify you again unless you are removed. **This is not a punishment**, you will be able to rejoin the server at any time following such removal.`,
          },
        ],
      });
      Log.d("tpwhky", "Succesfully warned user!");
      break;

    case "k":
      if (await canKick(user, targetServer, ctx)) {
        await dmChannelWithUser?.sendMessage({
          embeds: [
            {
              title: `You have been kicked from ${targetServer.name} for inactivity`,
              description:
                `You were removed from ${targetServer.name} for inactivity. **This is not a punishment**, you may rejoin the server at any time.`,
            },
          ],
        });

        const member = await targetServer.fetchMember(user);
	
	await member.kick()
      } else {
        Log.w("tpwhky", "We can't kick this user, skipping!");
      }
      break;
  }
}

export { thisisthepartwherehekillsyou };
