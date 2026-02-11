import { writable } from 'svelte/store';

export type DateRange = {
	start: Date;
	end: Date;
};

const getWeekRange = (date: Date): DateRange => {
	const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const dayOfWeek = base.getDay();
	const start = new Date(base.getFullYear(), base.getMonth(), base.getDate() - dayOfWeek);
	const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
	return { start, end };
};

const selectedWeek = writable<DateRange>(getWeekRange(new Date()));

const setSelectedWeek = (date: Date) => {
	selectedWeek.set(getWeekRange(date));
};

export { selectedWeek, setSelectedWeek, getWeekRange };
