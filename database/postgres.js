import Knex from "knex"

const knex = Knex({
	client: "pg",
	connection: {
		host: "db",
		port: 5432,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB
	}
});

/**
 * @typedef {Object} ServerActivity
 * @prop {string} user - ID of the user
 * @prop {number} lastActive - Timestamp
 */

/**
 * @param {string} id - Server id
 * @returns {import("knex").QueryBuilder<ServerActivity, {}>}
 */
function Server(id) { return knex(id) }

export { knex, Server }
