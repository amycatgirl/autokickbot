// @ts-check
import { Redis } from "ioredis";
import { Log } from "../utilities/log.js";
import { getKeys } from "../utilities/pubScan.js";

const KeyTypes = {
  Kick: "k",
  Warn: "w",
};

const pub = new Redis(6379, "redis");

pub.on("error", (error) => {
  Log.e("redis", "An error has occured within the Redis client!");
  Log.e("redis", error.message);
  if (error.stack) Log.e("redis", error.stack);
});

pub.once("connect", () => {
  Log.d("redis", "Connection established!");
});

pub.config("SET", "notify-keyspace-events", "Ex");

const sub = pub.duplicate();

sub.on("error", (error) => {
  Log.e("redis", "An error has occured within the Redis client!");
  Log.e("redis", error.message);
  if (error.stack) Log.e("redis", error.stack);
});

/**
 *
 * @typedef {object} Configuration
 * @prop {number} oldValue - Old value
 * @prop {number} newValue - New value
 *
 * @typedef {keyof typeof KeyTypes} Keys
 *
 * @typedef {number} KeysUpdated
 *
 * @async
 * @param {string} server - Server ID
 * @param {typeof KeyTypes[Keys]} type - w is for warnings, k is for kicks
 * @param {Configuration} seconds - Configuration
 *
 * @return {Promise<KeysUpdated>}
 */
async function migrateKeysToNewTTL(server, type, seconds) {
  const keysToMigrate = await getKeys(`${server}:*:${type}`);
  const diff = seconds.newValue - seconds.oldValue;

  let keysUpdated = 0;

  const batch = pub.multi();

  for await (const key of keysToMigrate) {
    const value = await pub.ttl(key);
    const newTTL = value + diff;

    batch.expire(key, newTTL);

    keysUpdated++;
  }

  await batch.exec();

  return keysUpdated;
}

export { pub, sub, migrateKeysToNewTTL };
