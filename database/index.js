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

export { knex }
