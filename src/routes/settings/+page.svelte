<script lang="ts">
	import ListCard from '$lib/components/ListCard.svelte';
	import TableCard from '$lib/components/TableCard.svelte';

	const systemSettings = [
		{ label: 'Postgres 자동 동기화', value: '활성화', status: 'ok' },
		{ label: '핵심 소모품 알림', value: '우선', status: 'warn' },
		{ label: '일일 요약 이메일', value: '오전 08:00', status: 'ok' }
	];

	const teamAccess = [
		{ role: '운영 리드', permission: '전체', scope: '전체 병동' },
		{ role: '간호 코디네이터', permission: '제한', scope: '담당 병동' },
		{ role: '물자 매니저', permission: '재고', scope: '약국 + 창고' }
	];

	const teamAccessColumns = [
		{ id: 'role', label: '역할' },
		{ id: 'permission', label: '권한' },
		{ id: 'scope', label: '범위' }
	];
</script>

<section class="grid-2">
	<ListCard
		title="시스템 설정"
		subtitle="알림, 동기화, 접근 권한을 관리하세요."
		items={systemSettings}
		getLabel={(item) => item.label}
		getValue={(item) => item.value}
		tone={(_, item) => item.status}
	/>
	<TableCard
		title="팀 접근"
		subtitle="역할 및 권한을 병동별로 관리하세요."
		columns={teamAccessColumns}
		rows={teamAccess}
	/>
</section>
