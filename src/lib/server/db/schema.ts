import { date, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const drugs = pgTable('drugs', {
	fdaClass: text('fda_class').notNull(),
	ingredientCode: text('ingredient_code').notNull(),
	drugCode: text('drug_code').primaryKey(),
	drugName: text('drug_name').notNull(),
	manufactor: text('manufactor').notNull(),
	atcCode: text('atc_code').notNull(),
	atcName: text('atc_name').notNull(),
	atc5: text('atc_5')
		.references(() => atcCodes.id)
		.notNull()
});

export const atcCodes = pgTable('atc_codes', {
	id: text('id').primaryKey(),
	name: text('name').notNull()
});

export const hospitals = pgTable('hospitals', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	password: text('password').notNull()
});

export const currentUsages = pgTable('current_usages', {
	id: serial('id').primaryKey(),
	hospitalId: text('hospital_id')
		.references(() => hospitals.id)
		.notNull(),
	drugId: text('drug_id')
		.references(() => atcCodes.id)
		.notNull(),
	quantity: numeric('quantity').notNull(),
	timestamp: date('timestamp', { mode: 'date' }).notNull()
});

export const supplyPredictions = pgTable('supply_predictions', {
	id: serial('id').primaryKey(),
	hospitalId: text('hospital_id')
		.references(() => hospitals.id)
		.notNull(),
	drugId: text('drug_id')
		.references(() => atcCodes.id)
		.notNull(),
	quantity: numeric('quantity').notNull(),
	upper: numeric('upper').notNull(),
	lower: numeric('lower').notNull(),
	time: date('time', { mode: 'date' }).notNull(),
	model: text('model').notNull()
});
