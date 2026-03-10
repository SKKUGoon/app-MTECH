<script lang="ts">
	import type { PageData } from './$types';
	import Modal from '$lib/components/Modal.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;
	type OrderCard = {
		id: number;
		title: string;
		quantity: string;
		bidCount: number;
		minBidPrice: string | null;
		minBidPriceLabel: string;
		expireAtIso: string;
		expireAtLabel: string;
		remainingTimeLabel: string;
		isExpired: boolean;
	};

	let orders: OrderCard[] = [];
	let currentRange: '1m' | '3m' | 'all' = 'all';
	let nowMs = Date.now();

	$: orders = (data as PageData & { orders?: OrderCard[] }).orders ?? [];
	$: currentRange = ((data as PageData & { range?: string }).range ?? 'all') as '1m' | '3m' | 'all';
	const rangeOptions: Array<{ id: '1m' | '3m' | 'all'; label: string }> = [
		{ id: '1m', label: '1달' },
		{ id: '3m', label: '3달' },
		{ id: 'all', label: '전체 기간' }
	];

	let selectedOrder: OrderCard | null = null;
	let modalOpen = false;

	const openOrderDetail = (order: OrderCard) => {
		selectedOrder = order;
		modalOpen = true;
	};

	const closeOrderDetail = () => {
		modalOpen = false;
		selectedOrder = null;
	};

	const setRangeFilter = async (nextRange: '1m' | '3m' | 'all') => {
		if (nextRange === currentRange) return;
		const params = new URLSearchParams(window.location.search);
		if (nextRange === 'all') {
			params.delete('range');
		} else {
			params.set('range', nextRange);
		}
		await goto(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, {
			invalidateAll: true
		});
	};

	const formatRemainingLive = (expireAtIso: string) => {
		const diffMs = new Date(expireAtIso).getTime() - nowMs;
		if (diffMs <= 0) return '경매 종료';
		const totalMinutes = Math.max(1, Math.floor(diffMs / 60000));
		const days = Math.floor(totalMinutes / (24 * 60));
		const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
		const minutes = totalMinutes % 60;
		if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
		if (hours > 0) return `${hours}시간 ${minutes}분`;
		return `${minutes}분`;
	};

	onMount(() => {
		const timer = setInterval(() => {
			nowMs = Date.now();
		}, 30_000);
		return () => clearInterval(timer);
	});
</script>

<section class="card">
	<h3>역경매 현황</h3>
	<p class="muted">카드를 눌러, 경매 진행 상황을 확인하세요.</p>
	<div class="order-filter" role="tablist" aria-label="주문 기간 필터">
		{#each rangeOptions as option}
			<button
				type="button"
				class:active={option.id === currentRange}
				on:click={() => setRangeFilter(option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>

	{#if orders.length === 0}
		<p class="muted order-empty">등록된 주문이 없습니다.</p>
	{:else}
		<div class="order-grid">
			{#each orders as order}
				<button type="button" class="order-card" on:click={() => openOrderDetail(order)}>
					{#if order.isExpired}
						<span class="expired-sticker">경매 종료. 주문됨</span>
					{:else}
						<span class="active-sticker">경매 진행중</span>
					{/if}
					<h4>{order.title}</h4>
					<div class="order-summary-row">
						<span class="order-summary-key">입찰가격 minimum</span>
						<span class="order-summary-value">{order.minBidPriceLabel}</span>
					</div>
					<div class="order-summary-row">
						<span class="order-summary-key">종료까지 남은 시각</span>
						<span class="order-summary-value">{formatRemainingLive(order.expireAtIso)}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</section>

<Modal
	open={modalOpen}
	title={selectedOrder ? `${selectedOrder.title} 주문 상세` : '주문 상세'}
	maxWidth="720px"
	on:close={closeOrderDetail}
>
	{#if selectedOrder}
		<div class="order-detail-grid">
			<div class="order-detail-item">
				<div class="order-detail-label">약품 이름</div>
				<div>{selectedOrder.title}</div>
			</div>
			<div class="order-detail-item">
				<div class="order-detail-label">수량</div>
				<div>{selectedOrder.quantity}</div>
			</div>
			<div class="order-detail-item">
				<div class="order-detail-label">총 입찰 건수</div>
				<div>
					{#if selectedOrder.bidCount === 0}
						현재 입찰 건수가 없습니다.
					{:else}
						{selectedOrder.bidCount}건
					{/if}
				</div>
			</div>
			<div class="order-detail-item">
				<div class="order-detail-label">입찰가격 minimum</div>
				<div>{selectedOrder.minBidPriceLabel}</div>
			</div>
			<div class="order-detail-item">
				<div class="order-detail-label">종료까지 남은 시각</div>
				<div>{formatRemainingLive(selectedOrder.expireAtIso)}</div>
			</div>
			<div class="order-detail-item">
				<div class="order-detail-label">종료 시각</div>
				<div>{selectedOrder.expireAtLabel}</div>
			</div>
		</div>
	{/if}
	<div slot="footer">
		<button type="button" class="button" on:click={closeOrderDetail}>닫기</button>
	</div>
</Modal>

<style>
	.order-empty {
		margin: 10px 0 0;
	}

	.order-filter {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 10px;
		padding: 6px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.62);
		border: 1px solid rgba(148, 163, 184, 0.24);
	}

	.order-filter button {
		padding: 6px 12px;
		border: none;
		border-radius: 999px;
		background: transparent;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--muted);
		cursor: pointer;
	}

	.order-filter button.active {
		background: rgba(107, 149, 232, 0.16);
		color: var(--primary-strong);
	}

	.order-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px;
		margin-top: 14px;
	}

	.order-card {
		position: relative;
		padding: 16px;
		border: 1px solid rgba(148, 163, 184, 0.35);
		border-radius: 14px;
		background: rgba(255, 255, 255, 0.78);
		text-align: left;
		cursor: pointer;
		box-shadow: 0 12px 24px rgba(31, 43, 58, 0.06);
		transition: transform 0.18s ease, box-shadow 0.18s ease;
	}

	.order-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 28px rgba(31, 43, 58, 0.12);
	}

	.order-card h4 {
		margin: 0 0 12px;
		font-size: 1rem;
		line-height: 1.35;
	}

	.order-summary-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 0;
		border-top: 1px dashed rgba(148, 163, 184, 0.3);
	}

	.order-summary-key {
		font-size: 0.78rem;
		color: var(--muted);
	}

	.order-summary-value {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--ink);
	}

	.expired-sticker {
		position: absolute;
		top: -10px;
		right: -8px;
		padding: 6px 10px;
		border-radius: 999px;
		background: linear-gradient(135deg, #d84b4b, #b93a3a);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 700;
		box-shadow: 0 10px 18px rgba(185, 58, 58, 0.28);
	}

	.active-sticker {
		position: absolute;
		top: -10px;
		right: -8px;
		padding: 6px 10px;
		border-radius: 999px;
		background: linear-gradient(135deg, #2fbe7a, #239763);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 700;
		box-shadow: 0 10px 18px rgba(35, 151, 99, 0.28);
		animation: active-sticker-blink 1.05s ease-in-out infinite;
	}

	@keyframes active-sticker-blink {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}

		50% {
			opacity: 0.48;
			transform: scale(1.03);
		}
	}

	.order-detail-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	.order-detail-item {
		padding: 12px;
		border: 1px solid rgba(148, 163, 184, 0.25);
		border-radius: 10px;
		background: rgba(248, 250, 252, 0.8);
	}

	.order-detail-label {
		font-size: 0.78rem;
		color: var(--muted);
		margin-bottom: 6px;
	}

	@media (max-width: 980px) {
		.order-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 720px) {
		.order-grid,
		.order-detail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
