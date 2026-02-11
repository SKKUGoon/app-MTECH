<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="login-card">
	<div class="brand" style="justify-content: center;">
		<div class="brand-badge">H</div>
		<div>
			<div>MTECH</div>
		</div>
	</div>

	<form class="login-form" method="POST">
		<div class="field">
			<label for="login-id">아이디</label>
			<input id="login-id" name="id" type="text" placeholder="아이디" required />
		</div>
		<div class="field">
			<label for="login-password">비밀번호</label>
			<input
				id="login-password"
				name="password"
				type="password"
				placeholder="비밀번호"
				required
			/>
		</div>

		<div class="login-actions">
			<label>
				<input type="checkbox" />
				<span>로그인 유지</span>
			</label>
			<!-- TODO: 후에 비밀번호 찾기 기능 추가 -->
			<a href="/" class="muted">비밀번호 찾기</a>
		</div>

		{#if form?.error}
			<div class="muted" style="color: #b64747;">{form.error}</div>
		{/if}

		<button class="button" type="submit">로그인</button>
	</form>
</div>
