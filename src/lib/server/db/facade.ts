import type { ActivityPoint, DashboardSummary, OrderItem } from './types';

export type DatabaseFacade = {
	getDashboardSummary: () => Promise<DashboardSummary>;
	getRecentOrders: () => Promise<OrderItem[]>;
	getActivity: () => Promise<ActivityPoint[]>;
};

const mockSummary: DashboardSummary = {
	metrics: [
		{ label: '입원', value: '128', delta: '+5.4%', status: 'ok' },
		{ label: '평균 대기', value: '14분', delta: '-2분', status: 'ok' },
		{ label: '긴급 알림', value: '6', delta: '+2', status: 'warn' },
		{ label: '공급 적체', value: '11', delta: '-3', status: 'urgent' }
	],
	activity: [
		{ label: '06:00', value: 12 },
		{ label: '09:00', value: 30 },
		{ label: '12:00', value: 46 },
		{ label: '15:00', value: 38 },
		{ label: '18:00', value: 42 }
	],
	occupancy: {
		used: 412,
		total: 500
	},
	inventory: [
		{ item: '인공호흡기 필터', value: '12개', status: 'urgent' },
		{ item: 'IV 키트', value: '84개', status: 'warn' },
		{ item: '혈액백', value: '220개', status: 'ok' }
	]
};

const mockOrders: OrderItem[] = [
	{
		id: 'ORD-3924',
		patient: 'A. Diaz',
		item: '호흡 마스크',
		status: '배송 중',
		eta: '12분',
		priority: '높음'
	},
	{
		id: 'ORD-3925',
		patient: 'K. Turner',
		item: 'IV 키트',
		status: '대기',
		eta: '32분',
		priority: '일반'
	},
	{
		id: 'ORD-3926',
		patient: 'J. Lee',
		item: 'Blood O-',
		status: '도착 완료',
		eta: '완료',
		priority: '긴급'
	}
];

export const mockDb: DatabaseFacade = {
	getDashboardSummary: async () => mockSummary,
	getRecentOrders: async () => mockOrders,
	getActivity: async () => mockSummary.activity
};
