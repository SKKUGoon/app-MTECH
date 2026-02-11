<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import Card from '$lib/components/Card.svelte';
	import ListCard from '$lib/components/ListCard.svelte';
	import MetricCard from '$lib/components/MetricCard.svelte';
	import TableCard from '$lib/components/TableCard.svelte';
	import { selectedWeek } from '$lib/stores/dateRange';
	import DrugSelect from '$lib/components/DrugSelect.svelte';

	export let data: PageData;

	const { summary, orders, drugOptions, hospitalId, defaultDrugId } = data;
	const recentOrderColumns = [
		{ id: 'id', label: '주문' },
		{ id: 'item', label: '품목' },
		{ id: 'status', label: '상태' },
		{ id: 'eta', label: '도착 예정' }
	];

	let activityCanvas: HTMLCanvasElement | null = null;
	let occupancyCanvas: HTMLCanvasElement | null = null;
	let activityChart: Chart | null = null;
	let occupancyChart: Chart | null = null;
	let lineChartReady = false;
	let selectedDrugId = defaultDrugId;
	let lastFetchKey = '';
	let hasLineData = true;
	let noDataLabel = '';
	$: selectedDrug = drugOptions.find((drug) => drug.id === selectedDrugId);

	const toDateKey = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const formatLabel = (dateKey: string) => {
		const [, month, day] = dateKey.split('-');
		return `${month}/${day}`;
	};

	const updateLineChart = (payload: {
		labels: string[];
		actual: (number | null)[];
		prediction: (number | null)[];
		upper: (number | null)[];
		lower: (number | null)[];
	}) => {
		if (!occupancyChart) return;
		occupancyChart.data.labels = payload.labels.map(formatLabel);
		occupancyChart.data.datasets[0].data = payload.lower;
		occupancyChart.data.datasets[1].data = payload.upper;
		occupancyChart.data.datasets[2].data = payload.actual;
		occupancyChart.data.datasets[3].data = payload.prediction;
		occupancyChart.update();
	};

	const fetchLineData = async () => {
		if (!selectedDrugId) return;
		const start = $selectedWeek.start;
		const end = $selectedWeek.end;
		const today = new Date();
		const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const actualEnd = new Date(todayDate);
		actualEnd.setDate(actualEnd.getDate() - 1);

		const params = new URLSearchParams({
			hospitalId,
			drugId: selectedDrugId,
			start: toDateKey(start),
			end: toDateKey(end),
			actualEnd: toDateKey(actualEnd)
		});

		const response = await fetch(`/api/usage-forecast?${params.toString()}`);
		if (!response.ok) return;
		const payload = await response.json();
		const hasAny =
			payload.actual.some((value: number | null) => value !== null) ||
			payload.prediction.some((value: number | null) => value !== null);
		hasLineData = hasAny;
		noDataLabel = hasAny
			? ''
			: selectedDrug
				? `${selectedDrug.name} (${selectedDrug.id})`
				: selectedDrugId;
		updateLineChart(payload);
	};

	onMount(() => {
		Chart.register(...registerables);

		if (activityCanvas) {
			activityChart = new Chart(activityCanvas, {
				type: 'bar',
				data: {
					labels: ['00시', '04시', '08시', '12시', '16시', '20시'],
					datasets: [
						{
							label: '내원',
							data: [12, 9, 18, 26, 22, 15],
							backgroundColor: 'rgba(136, 180, 250, 0.75)',
							borderRadius: 6
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: { ticks: { precision: 0 }, grid: { color: 'rgba(162, 191, 254, 0.2)' } },
						x: { grid: { display: false } }
					}
				}
			});
		}

		if (occupancyCanvas) {
			occupancyChart = new Chart(occupancyCanvas, {
				type: 'line',
				data: {
					labels: [],
					datasets: [
						{
							label: '예측 범위 하한',
							data: [],
							borderColor: 'rgba(0, 0, 0, 0)',
							backgroundColor: 'rgba(0, 0, 0, 0)',
							pointRadius: 0,
							tension: 0.35,
							fill: false
						},
						{
							label: '예측 범위',
							data: [],
							borderColor: 'rgba(162, 191, 254, 0)',
							backgroundColor: 'rgba(162, 191, 254, 0.18)',
							pointRadius: 0,
							tension: 0.35,
							fill: '-1'
						},
						{
							label: '실제',
							data: [],
							borderColor: 'rgba(107, 149, 232, 0.95)',
							backgroundColor: 'rgba(107, 149, 232, 0.2)',
							tension: 0.35,
							fill: false
						},
						{
							label: '예측',
							data: [],
							borderColor: 'rgba(162, 191, 254, 0.95)',
							backgroundColor: 'rgba(162, 191, 254, 0.12)',
							borderDash: [6, 4],
							tension: 0.35,
							fill: false
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								filter: (item) => item.text !== '예측 범위 하한'
							}
						}
					},
					scales: {
						y: { ticks: { precision: 0 } },
						x: { grid: { display: false } }
					}
				}
			});
			lineChartReady = true;
			lastFetchKey = `${selectedDrugId}-${toDateKey($selectedWeek.start)}-${toDateKey(
				$selectedWeek.end
			)}`;
			fetchLineData();
		}

		return () => {
			activityChart?.destroy();
			occupancyChart?.destroy();
		};
	});

	$: if (lineChartReady && selectedDrugId) {
		const nextKey = `${selectedDrugId}-${toDateKey($selectedWeek.start)}-${toDateKey(
			$selectedWeek.end
		)}`;
		if (nextKey !== lastFetchKey) {
			lastFetchKey = nextKey;
			fetchLineData();
		}
	}
</script>

<section class="grid-4">
	{#each summary.metrics as metric, index}
		{#if index === summary.metrics.length - 1}
			<div class="card metric-card">
				<div class="muted">약품 선택</div>
				<DrugSelect options={drugOptions} bind:value={selectedDrugId} />
			</div>
		{:else}
			<MetricCard label={metric.label} value={metric.value} delta={metric.delta} />
		{/if}
	{/each}
</section>

<section class="grid-2">
	<Card title="활동 추이" subtitle="시간대별 환자 유입 스냅샷.">
		<div style="height: 240px; margin-top: 12px;">
			<canvas bind:this={activityCanvas}></canvas>
		</div>
	</Card>
	<Card title="약품 사용량" subtitle="실제 사용량과 예측 범위">
		<div class:chart-empty={!hasLineData} class="line-chart-wrap">
			<canvas bind:this={occupancyCanvas}></canvas>
			{#if !hasLineData}
				<div class="chart-empty-overlay">No available data for {noDataLabel}.</div>
			{/if}
		</div>
	</Card>
</section>

<section class="grid-2">
	<ListCard
		title="재고 모니터링"
		items={summary.inventory}
		getLabel={(item) => item.item}
		getValue={(item) => item.value}
		tone={(_, item) => item.status}
	/>
	<TableCard title="최근 주문" columns={recentOrderColumns} rows={orders} />
</section>
