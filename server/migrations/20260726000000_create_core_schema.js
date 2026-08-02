exports.up = function(knex) {
  return knex.schema
    .createTable('programs', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    })
    .createTable('clients', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('parent_organization');
      table.string('audience_category');
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    })
    .createTable('sessions', function(table) {
      table.increments('id').primary();
      table.integer('client_id').unsigned().notNullable().references('id').inTable('clients');
      table.integer('program_id').unsigned().notNullable().references('id').inTable('programs');
      table.date('session_date').notNullable();
      table.string('session_label');
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    })
    .createTable('questions', function(table) {
      table.increments('id').primary();
      table.integer('client_id').unsigned().notNullable().references('id').inTable('clients');
      table.text('question_text').notNullable();
      table.string('question_type').notNullable();
      table.integer('display_order');
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    })
    .createTable('options', function(table) {
      table.increments('id').primary();
      table.integer('question_id').unsigned().notNullable().references('id').inTable('questions');
      table.string('option_text').notNullable();
      table.integer('display_order');
      table.timestamps(true, true);
    })
    .createTable('respondents', function(table) {
      table.increments('id').primary();
      table.integer('session_id').unsigned().notNullable().references('id').inTable('sessions');
      table.integer('response_id');
      table.string('role_type');
      table.integer('unanswered_count').defaultTo(0);
      table.text('unanswered_fields');
      table.timestamps(true, true);
    })
    .createTable('responses', function(table) {
      table.increments('id').primary();
      table.integer('respondent_id').unsigned().notNullable().references('id').inTable('respondents');
      table.integer('question_id').unsigned().notNullable().references('id').inTable('questions');
      table.integer('option_id').unsigned().nullable().references('id').inTable('options');
      table.text('answer_text');
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('responses')
    .dropTableIfExists('respondents')
    .dropTableIfExists('options')
    .dropTableIfExists('questions')
    .dropTableIfExists('sessions')
    .dropTableIfExists('clients')
    .dropTableIfExists('programs');
};
