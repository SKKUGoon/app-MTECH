import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

type SessionPayload = {
	id: string;
	name: string;
	iat: number;
};

const base64Url = (input: Buffer | string) =>
	Buffer.from(input).toString('base64url');

const fromBase64Url = (input: string) => Buffer.from(input, 'base64url');

const getSecret = () => {
	const secret = env.SESSION_SECRET;
	if (!secret) {
		throw new Error('SESSION_SECRET is required for secure sessions.');
	}
	return secret;
};

export const createSessionToken = (payload: Omit<SessionPayload, 'iat'>) => {
	const body: SessionPayload = { ...payload, iat: Date.now() };
	const bodyB64 = base64Url(JSON.stringify(body));
	const signature = createHmac('sha256', getSecret()).update(bodyB64).digest();
	const sigB64 = base64Url(signature);
	return `${bodyB64}.${sigB64}`;
};

export const verifySessionToken = (token: string) => {
	const [bodyB64, sigB64] = token.split('.');
	if (!bodyB64 || !sigB64) return null;

	const expected = createHmac('sha256', getSecret()).update(bodyB64).digest();
	const actual = fromBase64Url(sigB64);
	if (actual.length !== expected.length) return null;
	if (!timingSafeEqual(actual, expected)) return null;

	try {
		const json = fromBase64Url(bodyB64).toString('utf-8');
		return JSON.parse(json) as SessionPayload;
	} catch {
		return null;
	}
};
