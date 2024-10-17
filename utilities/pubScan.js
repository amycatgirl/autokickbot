// @ts-check
import { pub } from "../database/redis.js";

/**
 * @async
 *
 * Get keys from Redis pub
 *
 * @param {string} [pattern="*"] - Pattern to match
 * @param {number} [count=10]
 * @returns {Promise<any>}
 */
async function getKeys(pattern = "*", count = 10) {
  /** @type {string[]} */
  const result = await new Promise((resolve, reject) => {
    /** @type {string[]} */
    const results = [];

    const stream = pub.scanStream({
      match: pattern,
      count,
    });

    stream.on("data", (results) => {
      for (const key in results) {
        results.push(key);
      }
    });

    stream.on("end", () => {
      resolve(results);
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });

  return result;
}

export { getKeys };
