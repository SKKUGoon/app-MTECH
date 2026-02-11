<script lang="ts">
	import FileUploader from '$lib/components/FileUploader.svelte';
</script>

<div class="download-bar card">
	<div>
		<h3>데이터 입력 양식</h3>
		<p class="muted">엑셀 양식을 다운로드한 뒤 작성하세요.</p>
	</div>
	<div class="download-actions">
		<a class="button" href="/templates/inpatient_data_format.xlsx" download>
			입원 환자 양식 다운로드
		</a>
		<a class="button" href="/templates/outpatient_data_format.xlsx" download>
			외래 환자 양식 다운로드
		</a>
	</div>
</div>

<section class="grid-2">
	<div class="card">
		<h3>입원 환자 데이터 업로드</h3>
		<p class="muted">입원 환자 데이터를 엑셀 파일로 업로드하세요.</p>
		<FileUploader
			inputLabel="입원 환자 파일"
			helpText="입원 환자 엑셀(.xlsx) 파일을 선택하세요."
			buttonLabel="입원 환자 업로드"
		/>
	</div>

	<div class="card">
		<h3>외래 환자 데이터 업로드</h3>
		<p class="muted">외래 환자 데이터를 엑셀 파일로 업로드하세요.</p>
		<FileUploader
			inputLabel="외래 환자 파일"
			helpText="외래 환자 엑셀(.xlsx) 파일을 선택하세요."
			buttonLabel="외래 환자 업로드"
		/>
	</div>
</section>

<style>
	.download-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 20px 24px;
	}

	.download-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
</style>
