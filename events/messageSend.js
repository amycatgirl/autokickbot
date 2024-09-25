import dayjs from "dayjs";

import { knex } from "../database/postgres.js";
import { pub } from "../database/redis.js";
import { Log } from "../utilities/log.js";

/**
 * @param {import("revolt.js").Message} message
 */
async function messageSend(message) {
  if (
    message.author.bot ||
    !message.server ||
    message.systemMessage ||
    !message.author
  )
    return; // Exclude bot users from the action

  // query server config
  /** @type { string } */
  const { maxInactivePeriod } = await knex("config").first().where({
    server: message.server.id,
  });

  const [amount, unit] = maxInactivePeriod.split(" ")

  Log.d("messageSend", `Server's max inactive period: ${maxInactivePeriod}`)

  // format goes as follows
  /*
   * key: <server_id>:<user_id>
   * value: <last_message_id>
   * expiration date: current date + <server_config_max_date>
   */
  const kickV = await pub.get(
    `${message.server.id}:${message.author.id}:k`
  );
  const warnV = await pub.get(
    `${message.server.id}:${message.author.id}:k`
  );

  Log.d("messageSend", `${amount} ${unit}`)
  const kickExpiry = dayjs.duration(amount, unit).asSeconds();
  const warnExpiry = dayjs.duration(amount / 2, unit).asSeconds();

  const kickKey = `${message.server.id}:${message.author.id}:k`; // k stands for kick user
  const warnKey = `${message.server.id}:${message.author.id}:w`; // w stands for warn user

  if (!kickV && !warnV) {
	Log.d("messageSend", `Setting ${kickKey} to ${message.id} with ${kickExpiry} TTL`)
    await pub.set(kickKey, message.id, { EX: kickExpiry});
	await pub.set(warnKey, message.id, { EX: warnExpiry});
	
  } else if (kickV && !warnV) {
	Log.d("messageSend", `Updating ${warnKey} TTL to ${warnExpiry}`)
	await pub.expire(kickKey, kickExpiry);
	await pub.set(warnKey, message.id, { EX: warnExpiry});
  } else {
	Log.d("messageSend", `Updating ${kickKey} TTL to ${kickExpiry}`)
    // Update the key's expiry date
    await pub.expire(kickKey, kickExpiry);
	await pub.expire(warnKey, warnExpiry);
  }
}

export { messageSend };
