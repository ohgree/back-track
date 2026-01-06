<script lang="ts">
	import { postureStore } from '../stores/posture.svelte';
	import { i18n } from '../stores/i18n.svelte';

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	let score = $derived(postureStore.getPostureScore());

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-back-400';
		if (score >= 60) return 'text-warn-400';
		return 'text-danger-400';
	}

	function getScoreRing(score: number): { circumference: number; offset: number } {
		const circumference = 2 * Math.PI * 40;
		const offset = circumference - (score / 100) * circumference;
		return { circumference, offset };
	}

	let ring = $derived(getScoreRing(score));
</script>

<div class="glass rounded-2xl p-6 border border-white/10">
	<h3 class="font-display text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">{i18n.t('sessionStats')}</h3>

	<div class="flex items-center gap-6">
		<div class="relative w-24 h-24 flex-shrink-0">
			<svg class="w-24 h-24 transform -rotate-90">
				<circle
					cx="48"
					cy="48"
					r="40"
					fill="none"
					stroke="rgba(255,255,255,0.1)"
					stroke-width="8"
				/>
				<circle
					cx="48"
					cy="48"
					r="40"
					fill="none"
					stroke="currentColor"
					stroke-width="8"
					stroke-linecap="round"
					stroke-dasharray={ring.circumference}
					stroke-dashoffset={ring.offset}
					class="{getScoreColor(score)} transition-all duration-500"
				/>
			</svg>
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="text-2xl font-display font-bold {getScoreColor(score)}">{score}</span>
			</div>
		</div>

		<div class="flex-1 space-y-3">
			<div class="flex justify-between items-center">
				<span class="text-white/50 text-sm font-body">{i18n.t('sessionTime')}</span>
				<span class="text-white font-mono text-sm">{formatTime(postureStore.sessionStats.totalTime)}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-white/50 text-sm font-body">{i18n.t('goodPosture')}</span>
				<span class="text-back-400 font-mono text-sm">{formatTime(postureStore.sessionStats.goodPostureTime)}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-white/50 text-sm font-body">{i18n.t('alerts')}</span>
				<span class="text-warn-400 font-mono text-sm">{postureStore.sessionStats.alerts}</span>
			</div>
		</div>
	</div>
</div>

