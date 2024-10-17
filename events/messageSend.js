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
    !message.channel.server ||
    message.system ||
    !message.author
  )
    return; // Exclude bot users from the action

  // query server config
  const config = await knex("config").first().where({
    server: message.channel.server._id,
  });

  const [amount, unit] = config.maxInactivePeriod.split(" ");

  Log.d(
    "messageSend",
    `Server's max inactive period: ${config.maxInactivePeriod}`
  );

  // format goes as follows
  /*
   * key: <server_id>:<user_id>
   * value: <last_message_id>
   * expiration date: current date + <server_config_max_date>
   */
  const kickV = await pub.get(
    `${message.channel.server._id}:${message.author._id}:k`
  );
  const warnV = await pub.get(
    `${message.channel.server._id}:${message.author._id}:w`
  );

  if (!message.member.inferior && kickV) {
    Log.d("messageSend", "deleting keys!");
    const bulk = pub
      .multi()
      .del(`${message.channel.server._id}:${message.author._id}:k`)
      .del(`${message.channel.server._id}:${message.author._id}:k`);

    await bulk.exec();

    return;
  } else if (!message.member.inferior) return;

  Log.d("messageSend", `${amount} ${unit}`);
  const kickExpiry = dayjs.duration(amount, unit).asSeconds();
  const warnExpiry = dayjs.duration(amount / 2, unit).asSeconds();

  const kickKey = `${message.channel.server._id}:${message.author._id}:k`; // k stands for kick user
  const warnKey = `${message.channel.server._id}:${message.author._id}:w`; // w stands for warn user

  if (!kickV && !warnV) {
    Log.d(
      "messageSend",
      `Setting ${kickKey} to ${message._id} with ${kickExpiry} TTL`
    );
    await pub.set(kickKey, message._id, "EX", kickExpiry);
    await pub.set(warnKey, message._id, "EX", warnExpiry);
  } else if (kickV && !warnV) {
    Log.d("messageSend", `Updating ${warnKey} TTL to ${warnExpiry}`);
    await pub.expire(kickKey, kickExpiry);
    await pub.set(warnKey, message._id, { EX: warnExpiry });
  } else {
    Log.d("messageSend", `Updating ${kickKey} TTL to ${kickExpiry}`);
    // Update the key's expiry date
    await pub.expire(kickKey, kickExpiry);
    await pub.expire(warnKey, warnExpiry);
  }
}

export { messageSend };
