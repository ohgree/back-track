<script lang="ts">
	import { onMount } from 'svelte';
	import Camera from '$lib/components/camera.svelte';
	import Notification from '$lib/components/notification.svelte';
	import StatusCard from '$lib/components/status-card.svelte';
	import StatsCard from '$lib/components/stats-card.svelte';
	import SettingsCard from '$lib/components/settings-card.svelte';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<Notification />

<main class="min-h-screen p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		<header class="text-center mb-8 md:mb-12">
			<div class="inline-flex items-center gap-3 mb-4">
				<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-back-400 to-back-600 flex items-center justify-center shadow-lg shadow-back-500/30">
					<svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
						<path d="M9 8H15C15.5 8 16 8.5 16 9V14C16 14.5 15.5 15 15 15H14V22H10V15H9C8.5 15 8 14.5 8 14V9C8 8.5 8.5 8 9 8Z" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<h1 class="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
					BackTrack
				</h1>
			</div>
			<p class="text-white/50 font-body text-lg max-w-md mx-auto">
				AI-powered posture monitoring to keep your back healthy while you work
			</p>
		</header>

		<div class="grid lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2 space-y-6">
				{#if mounted}
					<Camera />
				{:else}
					<div class="aspect-[4/3] bg-black/50 rounded-2xl flex items-center justify-center">
						<div class="w-12 h-12 border-4 border-back-500 border-t-transparent rounded-full animate-spin"></div>
					</div>
				{/if}

				<div class="glass rounded-2xl p-5 border border-white/10">
					<h3 class="font-display font-semibold text-white/80 mb-3 flex items-center gap-2">
						<span>💡</span> Quick Tips
					</h3>
					<ul class="space-y-2 text-white/50 text-sm font-body">
						<li class="flex items-start gap-2">
							<span class="text-back-400">•</span>
							<span>Sit at arm's length from your screen (~50-70cm)</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-back-400">•</span>
							<span>Keep your shoulders level and relaxed</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-back-400">•</span>
							<span>Position camera at eye level for best tracking</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-back-400">•</span>
							<span>Take a break every 30 minutes to stretch</span>
						</li>
					</ul>
				</div>
			</div>

			<div class="space-y-6">
				<StatusCard />
				<StatsCard />
				<SettingsCard />

				<div class="glass rounded-2xl p-5 border border-white/10">
					<h3 class="font-display font-semibold text-white/80 mb-2 flex items-center gap-2">
						<span>🔒</span> Privacy First
					</h3>
					<p class="text-white/40 text-sm font-body">
						All processing happens locally in your browser. No video data is ever sent to any server.
					</p>
				</div>
			</div>
		</div>

		<footer class="mt-12 text-center">
			<p class="text-white/30 text-sm font-body">
				Built with Svelte & MediaPipe • Your posture, your privacy
			</p>
		</footer>
	</div>
</main>

<style>
	main {
		background-image:
			radial-gradient(ellipse at top, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 30%);
	}
</style>
