<script lang="ts">
	import { postureStore, PostureStatus, type PostureStatusType } from '../stores/posture.svelte.ts';

	interface StatusConfig {
		label: string;
		color: string;
		bgColor: string;
		borderColor: string;
		icon: string;
		glowColor: string;
	}

	function getStatusConfig(status: PostureStatusType): StatusConfig {
		switch (status) {
			case PostureStatus.GOOD:
				return {
					label: 'Perfect Posture',
					color: 'text-back-400',
					bgColor: 'bg-back-500/20',
					borderColor: 'border-back-500/30',
					icon: '✨',
					glowColor: 'shadow-back-500/30'
				};
			case PostureStatus.LEANING:
				return {
					label: 'Leaning Detected',
					color: 'text-warn-400',
					bgColor: 'bg-warn-500/20',
					borderColor: 'border-warn-500/30',
					icon: '↔️',
					glowColor: 'shadow-warn-500/30'
				};
			case PostureStatus.TOO_CLOSE:
				return {
					label: 'Too Close',
					color: 'text-warn-400',
					bgColor: 'bg-warn-500/20',
					borderColor: 'border-warn-500/30',
					icon: '📏',
					glowColor: 'shadow-warn-500/30'
				};
			case PostureStatus.SLOUCHING:
				return {
					label: 'Slouching',
					color: 'text-danger-400',
					bgColor: 'bg-danger-500/20',
					borderColor: 'border-danger-500/30',
					icon: '🔻',
					glowColor: 'shadow-danger-500/30'
				};
			default:
				return {
					label: 'Searching...',
					color: 'text-gray-400',
					bgColor: 'bg-gray-500/20',
					borderColor: 'border-gray-500/30',
					icon: '👀',
					glowColor: 'shadow-gray-500/30'
				};
		}
	}

	let config = $derived(getStatusConfig(postureStore.status));
</script>

<div class="glass rounded-2xl p-6 {config.borderColor} border transition-all duration-500 shadow-lg {config.glowColor}">
	<div class="flex items-center gap-4">
		<div class="text-4xl status-pulse">{config.icon}</div>
		<div>
			<h3 class="font-display text-lg font-semibold {config.color}">{config.label}</h3>
			<p class="text-white/50 text-sm font-body">
				Confidence: {postureStore.confidence}%
			</p>
		</div>
	</div>

	<div class="grid grid-cols-3 gap-4 mt-6">
		<div class="text-center">
			<p class="text-2xl font-display font-bold text-white">{postureStore.distance}<span class="text-sm text-white/50">cm</span></p>
			<p class="text-xs text-white/40 font-body mt-1">Distance</p>
		</div>
		<div class="text-center">
			<p class="text-2xl font-display font-bold text-white">{postureStore.leanAngle.toFixed(1)}°</p>
			<p class="text-xs text-white/40 font-body mt-1">Lean</p>
		</div>
		<div class="text-center">
			<p class="text-2xl font-display font-bold text-white">{postureStore.shoulderAngle}°</p>
			<p class="text-xs text-white/40 font-body mt-1">Slouch</p>
		</div>
	</div>
</div>

