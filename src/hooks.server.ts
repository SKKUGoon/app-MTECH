import type { Handle } from '@sveltejs/kit';
import { verifySessionToken } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');
	if (token) {
		const payload = verifySessionToken(token);
		if (payload) {
			event.locals.user = { id: payload.id, name: payload.name };
		}
	}

	return resolve(event);
};
