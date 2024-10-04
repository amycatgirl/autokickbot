import { ServerMember } from "revolt.js";
import { Log } from "../utilities/log.js";

/**
 * Add user to redis kv
 * @param {ServerMember} member
 */
async function memberJoin(member) {
  Log.d("mjoin", `Member ${member.user.username} joined!`);

  const { maxInactivePeriod } = await knex("config").first().where({
    server: member.server.id,
  });

  const [amount, unit] = maxInactivePeriod.split(" ");

  const kickExpiry = dayjs.duration(amount, unit).asSeconds(); // please abstract, please, i beg you
  const warnExpiry = dayjs.duration(amount / 2, unit).asSeconds();

  const kickKey = `${message.server.id}:${message.author.id}:k`;
  const warnKey = `${message.server.id}:${message.author.id}:w`;

  await pub.set(kickKey, message.id, { EX: kickExpiry });
  await pub.set(warnKey, message.id, { EX: warnExpiry });
}

export default memberJoin