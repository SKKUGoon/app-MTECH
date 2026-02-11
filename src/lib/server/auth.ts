import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const HASH_PREFIX = 'scrypt';

export const hashPassword = (password: string) => {
	const salt = randomBytes(16);
	const hash = scryptSync(password, salt, 64);
	return `${HASH_PREFIX}$${salt.toString('base64')}$${hash.toString('base64')}`;
};

export const verifyPassword = (password: string, stored: string) => {
	if (!stored.startsWith(`${HASH_PREFIX}$`)) {
		return false;
	}

	const [, saltB64, hashB64] = stored.split('$');
	if (!saltB64 || !hashB64) return false;

	const salt = Buffer.from(saltB64, 'base64');
	const hash = Buffer.from(hashB64, 'base64');
	const candidate = scryptSync(password, salt, hash.length);

	return timingSafeEqual(candidate, hash);
};
