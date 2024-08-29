import Knex from "knex"

const knex = Knex({
	client: "pg",
	connection: {
		host: "db",
		port: 5432,
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DATABASE
	}
});

/**
 * @typedef {Object} ServerActivity
 * @prop {string} user - ID of the user
 * @prop {number} lastActive - Timestamp
 */

/**
 * @function
 * @prop {string} id - Server id
 * @returns {Knex.QueryBuilder<ServerActivity, {}>}
 */
const Server = (id) => knex(id)

export { knex, Server }
