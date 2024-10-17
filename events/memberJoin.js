// @ts-check
import { Log } from "../utilities/log.js";
import { knex } from "../database/postgres.js";
import { pub } from "../database/redis.js";

import dayjs from "dayjs";

/**
 * Add user to redis kv
 * @param {import("revolt.js").Member} member
 */
async function memberJoin(member) {
  Log.d("mjoin", `Member ${member.user?.username} joined!`);

  const { minInactivePeriod } = await knex("config").first().where({
    server: member.server?._id,
  });

  const [amount, unit] = minInactivePeriod.split(" ");

  const kickExpiry = dayjs.duration(amount, unit).asSeconds(); // please abstract, please, i beg you
  const warnExpiry = dayjs.duration(amount / 2, unit).asSeconds();

  const kickKey = `${member.server?._id}:${member.user?._id}:k`;
  const warnKey = `${member.server?._id}:${member.user?._id}:w`;

  await pub.set(kickKey, "0".repeat(26), "EX", kickExpiry);
  await pub.set(warnKey, "0".repeat(26), "EX", warnExpiry);
}

export default memberJoin;
