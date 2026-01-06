<script>
  import "../app.css";
  import { i18n } from "$lib/stores/i18n.svelte";
  let { children } = $props();
</script>

<svelte:head>
  <title>{i18n.t("pageTitle")}</title>
</svelte:head>

{@render children()}
