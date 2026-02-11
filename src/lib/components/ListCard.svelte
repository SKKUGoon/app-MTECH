<script lang="ts">
	export let title: string = '';
	export let subtitle: string = '';
	export let tone: ((value: string | number, item: any) => string) | null = null;
	export let getLabel: (item: any) => string;
	export let getValue: (item: any) => string | number;
	export let items: any[] = [];
</script>

<div class="card">
	{#if title}
		<h3>{title}</h3>
	{/if}
	{#if subtitle}
		<p class="muted">{subtitle}</p>
	{/if}
	<div class="list">
		{#each items as item}
			<div class="list-item">
				<slot name="item" {item}>
					<span>{getLabel(item)}</span>
					{#if tone}
						<span class={`status ${tone(getValue(item), item)}`}>{getValue(item)}</span>
					{:else}
						<span>{getValue(item)}</span>
					{/if}
				</slot>
			</div>
		{/each}
	</div>
</div>
