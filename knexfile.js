// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: 'postgresql',
    connection: {
	database: "akb",
	user: "akb",
	password: "akb"
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      database: process.env.POSTGRES_DB,
      user:     process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
