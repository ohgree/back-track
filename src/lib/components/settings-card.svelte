<script lang="ts">
	import { postureStore } from '../stores/posture.svelte';
	import { notificationStore, NotificationType } from '../stores/notifications.svelte';

	let showSettings = $state(false);

	async function requestNotificationPermission(): Promise<void> {
		await notificationStore.requestPermission();
	}

	function testNotification(): void {
		// Send both in-app and browser notification for testing
		notificationStore.add('Test notification - Browser notifications are working!', NotificationType.SUCCESS);
		// Force browser notification even if tab is visible
		notificationStore.sendBrowserNotification('Test notification - Browser notifications are working!', NotificationType.SUCCESS);
	}
</script>

<div class="glass rounded-2xl border border-white/10 overflow-hidden">
	<button
		onclick={() => showSettings = !showSettings}
		class="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
	>
		<div class="flex items-center gap-3">
			<span class="text-xl">⚙️</span>
			<span class="font-display font-semibold text-white">Settings</span>
		</div>
		<svg
			class="w-5 h-5 text-white/50 transition-transform duration-300 {showSettings ? 'rotate-180' : ''}"
			fill="none" viewBox="0 0 24 24" stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if showSettings}
		<div class="p-4 space-y-4 border-t border-white/10">
			<!-- Recalibrate button -->
			<div class="flex items-center justify-between">
				<div>
					<p class="text-white text-sm font-body">Posture Calibration</p>
					<p class="text-white/40 text-xs">
						{#if postureStore.isCalibrated}
							Calibrated ✓
						{:else}
							Calibrating...
						{/if}
					</p>
				</div>
				<button
					onclick={() => postureStore.resetCalibration()}
					class="px-3 py-1.5 bg-warn-500/20 hover:bg-warn-500/30 text-warn-400 text-sm rounded-lg transition-colors"
				>
					Recalibrate
				</button>
			</div>

			<div class="flex items-center justify-between">
				<div>
					<p class="text-white text-sm font-body">Browser Notifications</p>
					<p class="text-white/40 text-xs">Get alerts even when tab is hidden</p>
				</div>
				{#if notificationStore.browserPermission === 'granted'}
					<div class="flex items-center gap-2">
						<span class="text-back-400 text-sm">✓ Enabled</span>
						<button
							onclick={testNotification}
							class="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs rounded transition-colors"
						>
							Test
						</button>
					</div>
				{:else if notificationStore.browserPermission === 'denied'}
					<span class="text-danger-400 text-sm">Blocked</span>
				{:else}
					<button
						onclick={requestNotificationPermission}
						class="px-3 py-1.5 bg-back-500/20 hover:bg-back-500/30 text-back-400 text-sm rounded-lg transition-colors"
					>
						Enable
					</button>
				{/if}
			</div>

			<div class="space-y-4">
				<p class="text-white/60 text-xs uppercase tracking-wider font-display">Sensitivity</p>

				<div>
					<div class="flex justify-between mb-1">
						<span class="text-white/70 text-sm font-body">Min Distance (cm)</span>
						<span class="text-white/50 text-sm font-mono">{postureStore.thresholds.minDistance}</span>
					</div>
					<input
						type="range"
						min="40"
						max="70"
						bind:value={postureStore.thresholds.minDistance}
						class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-back-500"
						aria-label="Minimum distance threshold"
					/>
					<div class="flex justify-between text-xs text-white/30 mt-1">
						<span>Closer</span>
						<span>Further</span>
					</div>
					{#if postureStore.thresholds.minDistance < 50}
						<p class="text-warn-400 text-xs mt-2 flex items-start gap-1.5">
							<span>⚠️</span>
							<span>OSHA recommends at least 50cm (arm's length) to reduce eye strain and maintain proper focus distance.</span>
						</p>
					{/if}
				</div>

				<div>
					<div class="flex justify-between mb-1">
						<span class="text-white/70 text-sm font-body">Max Lean Angle (°)</span>
						<span class="text-white/50 text-sm font-mono">{postureStore.thresholds.maxLeanAngle}</span>
					</div>
					<input
						type="range"
						min="5"
						max="20"
						bind:value={postureStore.thresholds.maxLeanAngle}
						class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-back-500"
						aria-label="Maximum lean angle threshold"
					/>
					<div class="flex justify-between text-xs text-white/30 mt-1">
						<span>Strict</span>
						<span>Relaxed</span>
					</div>
					{#if postureStore.thresholds.maxLeanAngle > 12}
						<p class="text-warn-400 text-xs mt-2 flex items-start gap-1.5">
							<span>⚠️</span>
							<span>Shoulder asymmetry above 10-12° can cause muscle imbalance and strain over prolonged periods.</span>
						</p>
					{/if}
				</div>

				<div>
					<div class="flex justify-between mb-1">
						<span class="text-white/70 text-sm font-body">Max Slouch Angle (°)</span>
						<span class="text-white/50 text-sm font-mono">{postureStore.thresholds.maxSlouchAngle}</span>
					</div>
					<input
						type="range"
						min="5"
						max="25"
						bind:value={postureStore.thresholds.maxSlouchAngle}
						class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-back-500"
						aria-label="Maximum slouch angle threshold"
					/>
					<div class="flex justify-between text-xs text-white/30 mt-1">
						<span>Strict</span>
						<span>Relaxed</span>
					</div>
					{#if postureStore.thresholds.maxSlouchAngle > 15}
						<p class="text-warn-400 text-xs mt-2 flex items-start gap-1.5">
							<span>⚠️</span>
							<span>Forward head posture above 15° significantly increases cervical spine load—each inch forward adds ~10 lbs of pressure.</span>
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

