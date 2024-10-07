/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
	return knex.schema.alterTable("config", (table) => {
		table.string("minInactivePeriod")
		table.boolean("calculateMinPeriod")
	})  
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.alterTable("config", (table) => {
		table.dropColumns("minInactivePeriod", "calculateMinPeriod")
	})
}