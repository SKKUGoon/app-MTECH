import type { PageServerLoad } from './$types';
import { db, drizzleDb } from '$lib/server/db';
import { atcCodes, hospitals } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const summary = await db.getDashboardSummary();
	const orders = await db.getRecentOrders();
	const drugOptions = await drizzleDb
		.select({ id: atcCodes.id, name: atcCodes.name })
		.from(atcCodes)
		.orderBy(asc(atcCodes.name));
	const hospitalRows = await drizzleDb.select({ id: hospitals.id }).from(hospitals).limit(1);
	const hospitalId = hospitalRows[0]?.id ?? 'HOSP0001';
	const defaultDrugId = drugOptions[0]?.id ?? '';

	return {
		summary,
		orders,
		drugOptions,
		hospitalId,
		defaultDrugId
	};
};
