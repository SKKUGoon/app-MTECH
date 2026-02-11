import { mockDb } from './facade';
import { drizzleDb, pool } from './drizzle';

export const db = mockDb;
export { drizzleDb, pool };

export * from './types';
export * from './config';
export * from './schema';
