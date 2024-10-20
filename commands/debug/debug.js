// @ts-check
import { Command } from "../index.js";
import { Log } from "../../utilities/log.js";
import { migrateKeysToNewTTL } from "../../database/redis.js";
import { catchErrorTyped } from "../../utilities/catchErrorTyped.js";
import { inspect } from "util";

class DebugCommand extends Command {
  constructor() {
    super();

    this.name = "debug";
    this.description = "Developer only command";
    this.dev = true;

    this.requiredArguments = 1;
    this.usage = "debug <debugFunction>";
  }

  /**
   * @param {import("revolt.js").Message} ctx
   * @param {string[]} args
   */
  async execute(args, ctx) {
    switch (args[0]) {
      case "migrateRedisKeys":
        const type = args[1];
        const oldValue = args[2];
        const newValue = args[3];

        Log.d("debug", `${type} ${oldValue} ${newValue}`);

        const result = await migrateKeysToNewTTL(
          //@ts-expect-error the bot can't process messages on dms
          ctx.channel.server?._id,
          type,
          {
            oldValue,
            newValue,
          }
        );

        return `Migrated ${result} keys successfully!`;
      case "triggerRatelimit":
        let hasNotErrored = true;
        let calls = 0;
        let catchedError;
        while (hasNotErrored) {
          const [error, message] = await catchErrorTyped(
            //@ts-expect-error channel exists, dumbass
            ctx.channel.fetchMessages({ limit: 100 }),
            [Error]
          );

          calls++;

          if (error) {
            hasNotErrored = false;
            catchedError = error;
          }
        }

        Log.e("debug", inspect(catchedError));
        return `Took ${calls} calls to trigger a rate limit!\n\`\`\`js\n${catchedError}\n\`\`\``;
      default:
        throw `Usage: ${this.usage}`;
    }
  }
}

export default DebugCommand;
