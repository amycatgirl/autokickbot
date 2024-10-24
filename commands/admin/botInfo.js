// @ts-check
import {Command} from "../index.js";
import {knex} from "../../database/postgres.js";
import {Log} from "../../utilities/log.js";
import {pub} from "../../database/redis.js";

import {inspect} from "node:util";

class InformationCommand extends Command {
  constructor() {
    super();

    this.name = "info";
    this.description = "Information about this bot.";
  }

  /**
   * @param {string[]} args
   * @param _ctx
   * @returns {Promise<string | void>}
   */
  async execute(args, _ctx) {
    const postgres_version = await knex.raw("select version()");
    Log.d("psql", postgres_version);

    /** @type {string} */
    // @ts-expect-error I already ensure it is _always_ a string
    const redis_info = await pub.call("info", (err, value) => {
      if (err) throw err;

      return typeof value === "string" ? value : "";
    });
    const redis_version = redis_info?.split("\n")[1].split(":")[1];
    const { default: packageManifest } = await import("../../package.json", {
      assert: {
        type: "json",
      },
    });

    if (!packageManifest) throw new Error("Unable to read package manifest!");

    Log.d("import", inspect(packageManifest));

    if (args[0] !== "extra")
      return `Using:\n\`\`\`\n${postgres_version.rows[0]["version"]}\nRedis ${redis_version}\nautokickbot v${packageManifest.version}\nNodeJS ${process.version}\n\`\`\`\n[[Source Code]](<${packageManifest.homepage}>)`;

    return `Using:\n\`\`\`\n${
      postgres_version.rows[0]["version"]
    }\nRedis ${redis_version}\nautokickbot v${
      packageManifest.version
    }\nNodeJS ${process.version}\n\`\`\`\nPackages:\n\`\`\`json\n${inspect({
      ...packageManifest.dependencies,
      ...packageManifest.devDependencies,
    })}\n\`\`\`\n[[Source Code]](<${packageManifest.homepage}>)`;
  }
}

export default InformationCommand;
