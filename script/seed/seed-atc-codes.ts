import fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { parse } from 'csv-parse/sync';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { atcCodes } from '../../src/lib/server/db/schema';

const filePath = process.argv[2]
	? path.resolve(process.argv[2])
	: path.resolve('script/seed/ATC_20250912_110516.csv');

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

const pool = new Pool(dbConfig);
const db = drizzle(pool);

const buffer = await fs.readFile(filePath);
const decoded = iconv.decode(buffer, 'euc-kr');

const records = parse(decoded, {
	from_line: 2,
	skip_empty_lines: true,
	relax_column_count: true
});

const atcNameMap = new Map<string, Set<string>>();

for (const row of records as string[][]) {
	const atcCode = String(row[5] ?? '').trim();
	const atcName = String(row[6] ?? '').trim();
	if (!atcCode || atcCode.length < 5) continue;
	const atc5 = atcCode.slice(0, 5);
	const existing = atcNameMap.get(atc5) ?? new Set<string>();
	if (atcName) existing.add(atcName);
	atcNameMap.set(atc5, existing);
}

const rows = Array.from(atcNameMap.entries()).map(([id, names]) => ({
	id,
	name: Array.from(names).join(', ')
}));

const chunkSize = 1000;
let inserted = 0;

for (let i = 0; i < rows.length; i += chunkSize) {
	const batch = rows.slice(i, i + chunkSize);
	await db.insert(atcCodes).values(batch).onConflictDoNothing();
	inserted += batch.length;
}

await pool.end();

console.log(`Seeded ${inserted} ATC code rows from ${path.basename(filePath)}.`);
