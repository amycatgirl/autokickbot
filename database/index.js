import Knex from "knex"

const knex = Knex({
	client: "pg",
	connection: {
		host: "db",
		port: 27017,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE
	}
});

export { knex }
