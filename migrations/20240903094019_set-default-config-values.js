/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex("config").update({
	minInactivePeriod: "3 days",
	warnPeriod: "3 days",
	calculateWarnPeriod: true
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("config")
};
