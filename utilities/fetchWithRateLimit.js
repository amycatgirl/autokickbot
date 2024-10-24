import { catchErrorTyped } from "./catchErrorTyped.js";
import { Log } from "./log.js";
import { artificialDelay } from "./artificialDelay.js";

class MessageNotFoundException extends Error {
  constructor() {
    super();

    this.name = "MessageNotFound";
    this.message = "Could not find message in channel.";
  }
}

/**
 * @param { import("revolt.js").Channel } channel
 * @param {Partial<{
 *   limit: number
 *   before: string
 *   after: string
 * }>} options - Options to pass to the fetch function
 *
 * @returns {Promise<import("revolt.js").Message[]>}
 */

async function fetchWithRateLimit(channel, options) {
  const [error, message] = await catchErrorTyped(
    channel.fetchMessages(options),
    [Error]
  );

  if (error && error.response.status === 429) {
    await artificialDelay(error.response["x-ratelimit-reset-after"], true);

    return await fetchWithRateLimit(channel, options);
  }

  Log.d("found message", `${message.author}`);

  return message;
}

export { fetchWithRateLimit, MessageNotFoundException };
