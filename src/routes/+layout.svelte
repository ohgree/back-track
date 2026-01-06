<script>
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>BackTrack — Posture Monitoring</title>
</svelte:head>

{@render children()}

