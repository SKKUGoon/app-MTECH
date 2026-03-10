import type { PageServerLoad } from './$types';
import { drizzleDb } from '$lib/server/db';
import { auctionBids, auctionRegInventory, drugs } from '$lib/server/db/schema';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

const BASELINE_DATE = new Date('2024-12-07T23:59:59.999Z');
const RANGE_OPTIONS = new Set(['1m', '3m', 'all']);

const parseNumber = (value: unknown) => {
	const numeric = Number(String(value ?? '').replace(/,/g, '').trim());
	return Number.isFinite(numeric) ? numeric : null;
};

const formatPrice = (value: unknown) => {
	const numeric = parseNumber(value);
	if (numeric === null) return null;
	return `${numeric.toLocaleString('ko-KR')}원`;
};

const formatDateTime = (value: Date) => {
	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, '0');
	const day = String(value.getDate()).padStart(2, '0');
	const hour = String(value.getHours()).padStart(2, '0');
	const minute = String(value.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day} ${hour}:${minute}`;
};

const formatRemaining = (expireAt: Date, now: Date) => {
	const diffMs = expireAt.getTime() - now.getTime();
	if (diffMs <= 0) {
		return { isExpired: true, label: '경매 종료' };
	}

	const totalMinutes = Math.max(1, Math.ceil(diffMs / 60000));
	const days = Math.floor(totalMinutes / (24 * 60));
	const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
	const minutes = totalMinutes % 60;

	if (days > 0) {
		return { isExpired: false, label: `${days}일 ${hours}시간 ${minutes}분` };
	}

	if (hours > 0) {
		return { isExpired: false, label: `${hours}시간 ${minutes}분` };
	}

	return { isExpired: false, label: `${minutes}분` };
};

const getRangeStart = (range: string) => {
	if (range === '1m') {
		const start = new Date(BASELINE_DATE);
		start.setMonth(start.getMonth() - 1);
		return start;
	}

	if (range === '3m') {
		const start = new Date(BASELINE_DATE);
		start.setMonth(start.getMonth() - 3);
		return start;
	}

	return null;
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const hospitalId = locals.user?.id ?? 'HOSP0001';
	const now = new Date();
	const requestedRange = (url.searchParams.get('range') ?? 'all').trim();
	const range = RANGE_OPTIONS.has(requestedRange) ? requestedRange : 'all';
	const rangeStart = getRangeStart(range);
	const whereClause = rangeStart
		? and(eq(auctionRegInventory.hospitalId, hospitalId), gte(auctionRegInventory.createdAt, rangeStart))
		: eq(auctionRegInventory.hospitalId, hospitalId);

	const rows = await drizzleDb
		.select({
			id: auctionRegInventory.id,
			title: drugs.drugName,
			quantity: auctionRegInventory.quantity,
			expireAt: auctionRegInventory.expireAt,
			bidCount: sql<number>`count(${auctionBids.id})`,
			minBidPrice: sql<string | null>`min(${auctionBids.price})`
		})
		.from(auctionRegInventory)
		.innerJoin(drugs, eq(auctionRegInventory.drugId, drugs.drugCode))
		.leftJoin(auctionBids, eq(auctionBids.regInventoryId, auctionRegInventory.id))
		.where(whereClause)
		.groupBy(
			auctionRegInventory.id,
			drugs.drugName,
			auctionRegInventory.quantity,
			auctionRegInventory.expireAt,
			auctionRegInventory.createdAt
		)
		.orderBy(desc(auctionRegInventory.createdAt));

	const orders = rows.map((row) => {
		const bidCount = Number(row.bidCount ?? 0);
		const hasBids = bidCount > 0;
		const remaining = formatRemaining(row.expireAt, now);

		return {
			id: row.id,
			title: row.title,
			quantity: String(row.quantity),
			bidCount,
			minBidPrice: hasBids ? formatPrice(row.minBidPrice) : null,
			minBidPriceLabel: hasBids
				? (formatPrice(row.minBidPrice) ?? '현재 입찰 건수가 없습니다.')
				: '현재 입찰 건수가 없습니다.',
			expireAtIso: row.expireAt.toISOString(),
			expireAtLabel: formatDateTime(row.expireAt),
			remainingTimeLabel: remaining.label,
			isExpired: remaining.isExpired
		};
	});

	return {
		orders,
		range
	};
};
