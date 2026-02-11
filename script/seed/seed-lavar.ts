import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { inArray } from 'drizzle-orm';
import { atcCodes, currentUsages, supplyPredictions } from '../../src/lib/server/db/schema';

const filePath = process.argv[2]
	? path.resolve(process.argv[2])
	: path.resolve('script/seed/LAVAR_persistences.csv');

const dbConfig = {
	host: process.env.DB_HOST ?? '127.0.0.1',
	port: Number(process.env.DB_PORT ?? 5432),
	user: process.env.DB_USER ?? 'postgres',
	password: process.env.DB_PASSWORD ?? 'postgres',
	database: process.env.DB_NAME ?? 'hecon',
	ssl:
		process.env.DB_SSL === 'true'
			? {
					rejectUnauthorized: false
				}
			: false
};

const hospitalId = process.env.SEED_HOSPITAL_ID ?? 'HOSP0001';
const modelName = process.env.SEED_MODEL ?? 'LAVAR';

const pool = new Pool(dbConfig);
const db = drizzle(pool);

const rawCsv = await fs.readFile(filePath, 'utf-8');
const records: string[][] = parse(rawCsv, {
	skip_empty_lines: true,
	relax_column_count: true
});

if (records.length < 4) {
	throw new Error('CSV does not have enough rows for headers and data.');
}

const header = records[0];
const typeRow = records[1];

type AtcColumnMap = {
	real?: number;
	pred?: number;
	upper?: number;
	lower?: number;
};

const columnMap = new Map<string, AtcColumnMap>();

for (let i = 1; i < header.length; i += 1) {
	const atcCode = String(header[i] ?? '').trim();
	const type = String(typeRow[i] ?? '').trim();
	if (!atcCode || !type) continue;

	const existing = columnMap.get(atcCode) ?? {};
	if (type === 'real') existing.real = i;
	if (type === 'pred') existing.pred = i;
	if (type === 'pred_upper') existing.upper = i;
	if (type === 'pred_lower') existing.lower = i;
	columnMap.set(atcCode, existing);
}

const atc5Codes = Array.from(
	new Set(Array.from(columnMap.keys()).map((code) => code.slice(0, 5)))
);
const atcRows = atc5Codes.length
	? await db.select({ id: atcCodes.id }).from(atcCodes).where(inArray(atcCodes.id, atc5Codes))
	: [];
const validAtc5 = new Set(atcRows.map((row) => row.id));

const toNumericString = (value: string | undefined) => {
	const trimmed = String(value ?? '').trim();
	if (!trimmed) return null;
	const num = Number(trimmed);
	if (Number.isNaN(num)) return null;
	return trimmed;
};

const usageBatch: {
	hospitalId: string;
	drugId: string;
	quantity: string;
	timestamp: Date;
}[] = [];

const predictionBatch: {
	hospitalId: string;
	drugId: string;
	quantity: string;
	upper: string;
	lower: string;
	time: Date;
	model: string;
}[] = [];

const flushBatch = async () => {
	if (usageBatch.length > 0) {
		await db.insert(currentUsages).values(usageBatch);
		usageBatch.length = 0;
	}
	if (predictionBatch.length > 0) {
		await db.insert(supplyPredictions).values(predictionBatch);
		predictionBatch.length = 0;
	}
};

const dataRows = records.slice(3);
const chunkSize = 1000;

	for (const row of dataRows) {
		const dateText = String(row[0] ?? '').trim();
		if (!dateText) continue;
		const date = new Date(dateText);
		if (Number.isNaN(date.getTime())) continue;

	for (const [atcCode, columns] of columnMap) {
		const atc5 = atcCode.slice(0, 5);
		if (!validAtc5.has(atc5) || columns.real === undefined || columns.pred === undefined) {
			continue;
		}

		const realValue = toNumericString(row[columns.real]);
		if (realValue !== null) {
			usageBatch.push({
				hospitalId,
				drugId: atc5,
				quantity: realValue,
				timestamp: date
			});
		}

		const predValue = toNumericString(row[columns.pred]);
		const upperValue = toNumericString(row[columns.upper ?? -1]);
		const lowerValue = toNumericString(row[columns.lower ?? -1]);
		if (predValue !== null && upperValue !== null && lowerValue !== null) {
			predictionBatch.push({
				hospitalId,
				drugId: atc5,
				quantity: predValue,
				upper: upperValue,
				lower: lowerValue,
				time: date,
				model: modelName
			});
		}
	}

	if (usageBatch.length >= chunkSize || predictionBatch.length >= chunkSize) {
		await flushBatch();
	}
}

await flushBatch();
await pool.end();

console.log(`Seeded LAVAR data for hospital ${hospitalId}.`);
