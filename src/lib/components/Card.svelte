<script lang="ts">
	export let title: string = '';
	export let subtitle: string = '';
</script>

<div class="card" {...$$restProps}>
	{#if title}
		<h3>{title}</h3>
	{/if}
	{#if subtitle}
		<p class="muted">{subtitle}</p>
	{/if}
	<slot />
</div>
