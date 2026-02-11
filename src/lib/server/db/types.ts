export type Metric = {
	label: string;
	value: string;
	delta: string;
	status: 'ok' | 'warn' | 'urgent';
};

export type ActivityPoint = {
	label: string;
	value: number;
};

export type DashboardSummary = {
	metrics: Metric[];
	activity: ActivityPoint[];
	occupancy: {
		used: number;
		total: number;
	};
	inventory: {
		item: string;
		value: string;
		status: 'ok' | 'warn' | 'urgent';
	}[];
};

export type OrderItem = {
	id: string;
	patient: string;
	item: string;
	status: '대기' | '배송 중' | '도착 완료' | '보류';
	eta: string;
	priority: '일반' | '높음' | '긴급';
};
