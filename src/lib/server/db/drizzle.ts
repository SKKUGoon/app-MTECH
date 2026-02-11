import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { dbConfig } from './config';
import * as schema from './schema';

export const pool = new Pool({
	host: dbConfig.host,
	port: dbConfig.port,
	user: dbConfig.user,
	password: dbConfig.password,
	database: dbConfig.database
});

export const drizzleDb = drizzle(pool, { schema });
