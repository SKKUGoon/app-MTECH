<script lang="ts">
	export let label: string;
	export let value: string | number;
	export let delta: string;
</script>

<div class="card metric-card">
	<div class="metric-header">
		<div class="muted">{label}</div>
	</div>
	<div class="kpi-value">{value}</div>
	<div class="pill">{delta}</div>
</div>
