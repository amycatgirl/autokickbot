import { Command } from "../index.js";
import { guildJoin } from "../../events/index.js";
import { knex } from "../../database/postgres.js";

class RegenerateCommand extends Command {
  constructor() {
    super();
    this.name = "regenerate";
    this.description = "Debug command";
    this.usage = "regenerate <what> [other arguments]";

    this.requiredArguments = 1;

    this.dev = true;
  }

  /**
   * @param {import("revolt.js").Message} ctx - Context
   * @param {string[]} args - arguments
   *
   * @returns {Promise<string | void>}
   */
  async execute(args, ctx) {
    const [what, ...other] = args;

    switch (what) {
      case "redisKeys":
        await guildJoin(
          { server: { _id: ctx.channel.server._id } },
          ctx.client,
          true
        );
        return "Done regenerating redis keys for this server!";
      case "config":
        await knex("config")
          .insert({
            server: ctx.channel.server._id,
            maxInactivePeriod: "1 weeks",
            minInactivePeriod: "3 days",
            warnPeriod: "3 days",
            calculateWarnPeriod: true,
          })
          .onConflict("server")
          .ignore();
        return "Done regenerating server config!";
      case "list":
        return "Available options:\n- redisKeys\n- config";
      default:
        throw `Usage: ${this.usage}`;
    }
  }
}

export default RegenerateCommand;
