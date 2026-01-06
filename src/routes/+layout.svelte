<script>
  import { dev } from "$app/environment";
  import { i18n } from "$lib/stores/i18n.svelte";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

  import "../app.css";

  injectSpeedInsights();
  injectAnalytics({ mode: dev ? "development" : "production" });
  let { children } = $props();
</script>

<svelte:head>
  <title>{i18n.t("pageTitle")}</title>
</svelte:head>

{@render children()}
