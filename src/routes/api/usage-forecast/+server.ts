import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { and, eq, gte, lte } from 'drizzle-orm';
import { drizzleDb } from '$lib/server/db';
import { currentUsages, supplyPredictions } from '$lib/server/db/schema';

const toDateKey = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const parseDate = (value: string | null) => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getDateRange = (start: Date, end: Date) => {
	const days: Date[] = [];
	const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
	while (cursor <= end) {
		days.push(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
		cursor.setDate(cursor.getDate() + 1);
	}
	return days;
};

export const GET: RequestHandler = async ({ url }) => {
	const hospitalId = url.searchParams.get('hospitalId') ?? 'HOSP0001';
	const drugId = url.searchParams.get('drugId');
	const start = parseDate(url.searchParams.get('start'));
	const end = parseDate(url.searchParams.get('end'));
	const actualEnd = parseDate(url.searchParams.get('actualEnd'));

	if (!drugId || !start || !end) {
		return json({ message: 'Missing required parameters.' }, { status: 400 });
	}

	const labels = getDateRange(start, end).map(toDateKey);
	const actualMap = new Map<string, number>();
	const predictionMap = new Map<string, { value: number; upper: number; lower: number }>();

	if (actualEnd && actualEnd >= start) {
		const usageRows = await drizzleDb
			.select({ date: currentUsages.timestamp, quantity: currentUsages.quantity })
			.from(currentUsages)
			.where(
				and(
					eq(currentUsages.hospitalId, hospitalId),
					eq(currentUsages.drugId, drugId),
					gte(currentUsages.timestamp, start),
					lte(currentUsages.timestamp, actualEnd)
				)
			);

		for (const row of usageRows) {
			const dateKey = toDateKey(new Date(row.date));
			actualMap.set(dateKey, Number(row.quantity));
		}
	}

	const predictionRows = await drizzleDb
		.select({
			date: supplyPredictions.time,
			quantity: supplyPredictions.quantity,
			upper: supplyPredictions.upper,
			lower: supplyPredictions.lower
		})
		.from(supplyPredictions)
		.where(
			and(
				eq(supplyPredictions.hospitalId, hospitalId),
				eq(supplyPredictions.drugId, drugId),
				gte(supplyPredictions.time, start),
				lte(supplyPredictions.time, end)
			)
		);

	for (const row of predictionRows) {
		const dateKey = toDateKey(new Date(row.date));
		predictionMap.set(dateKey, {
			value: Number(row.quantity),
			upper: Number(row.upper),
			lower: Math.max(0, Number(row.lower))
		});
	}

	const actual = labels.map((label) => actualMap.get(label) ?? null);
	const prediction = labels.map((label) => predictionMap.get(label)?.value ?? null);
	const upper = labels.map((label) => predictionMap.get(label)?.upper ?? null);
	const lower = labels.map((label) => predictionMap.get(label)?.lower ?? null);

	return json({
		labels,
		actual,
		prediction,
		upper,
		lower
	});
};
