<script lang="ts" module>
	export type DrugOption = {
		id: string;
		name: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		options?: DrugOption[];
		value?: string | null;
		placeholder?: string;
	};

	let { options = [], value = $bindable(null), placeholder = '약품 선택' }: Props =
		$props();

	let open = $state(false);
	let rootRef = $state<HTMLDivElement | null>(null);

	const selected = () => options.find((option) => option.id === value);

	const selectOption = (option: DrugOption) => {
		value = option.id;
		open = false;
	};

	const handleToggle = () => {
		open = !open;
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (!open) return;
		const target = event.target as Node;
		if (rootRef?.contains(target)) return;
		open = false;
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (!open) return;
		if (event.key === 'Escape') open = false;
	};

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="drug-select" bind:this={rootRef}>
	<button class="drug-trigger" type="button" onclick={handleToggle}>
		<div class="drug-trigger-text">
			<span class="drug-name">{selected()?.name ?? placeholder}</span>
			{#if selected()?.id}
				<span class="drug-id">{selected()?.id}</span>
			{/if}
		</div>
		<span class:open={open} class="drug-caret">▾</span>
	</button>

	{#if open}
		<div class="drug-menu">
			{#each options as option}
				<button
					type="button"
					class:selected={option.id === value}
					class="drug-option"
					onclick={() => selectOption(option)}
				>
					<span class="drug-option-name">{option.name}</span>
					<span class="drug-option-id">{option.id}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.drug-select {
		position: relative;
		width: 100%;
	}

	.drug-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border: 1px solid rgba(255, 255, 255, 0.85);
		background: rgba(255, 255, 255, 0.9);
		border-radius: 14px;
		padding: 10px 12px;
		box-shadow: 6px 6px 14px rgba(163, 181, 198, 0.18);
		cursor: pointer;
		font-family: inherit;
	}

	.drug-trigger-text {
		display: flex;
		align-items: baseline;
		gap: 6px;
		flex: 1;
		min-width: 0;
	}

	.drug-name {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink);
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.drug-id {
		font-size: 0.7rem;
		color: var(--muted);
		flex: 0 0 auto;
	}

	.drug-caret {
		font-size: 0.8rem;
		color: var(--muted);
		transition: transform 0.2s ease;
	}

	.drug-caret.open {
		transform: rotate(180deg);
	}

	.drug-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		max-height: 220px;
		overflow: auto;
		padding: 8px;
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.98);
		border: 1px solid rgba(255, 255, 255, 0.85);
		box-shadow: var(--shadow-glass);
		z-index: 20;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.drug-option {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
		width: 100%;
		border: none;
		padding: 10px 12px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		font-family: inherit;
	}

	.drug-option.selected {
		background: rgba(87, 183, 196, 0.2);
	}

	.drug-option-name {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink);
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	.drug-option-id {
		font-size: 0.7rem;
		color: var(--muted);
		flex: 0 0 auto;
	}
</style>
