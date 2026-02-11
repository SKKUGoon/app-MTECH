import { env } from '$env/dynamic/private';

export const dbConfig = {
	host: env.DB_HOST ?? '127.0.0.1',
	port: Number(env.DB_PORT ?? 5432),
	user: env.DB_USER ?? 'postgres',
	password: env.DB_PASSWORD ?? 'postgres',
	database: env.DB_NAME ?? 'hecon',
	ssl:
		env.DB_SSL === 'true'
			? {
					rejectUnauthorized: false
				}
			: false
};

export const dbStatus = {
	engine: 'postgres',
	label: `${dbConfig.host}:${dbConfig.port} · ${dbConfig.database}`
};
