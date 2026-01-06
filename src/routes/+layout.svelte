<script>
  import { i18n } from "$lib/stores/i18n.svelte";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import "../app.css";

  injectSpeedInsights();
  let { children } = $props();
</script>

<svelte:head>
  <title>{i18n.t("pageTitle")}</title>
</svelte:head>

{@render children()}
