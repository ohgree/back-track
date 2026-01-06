<script lang="ts">
  import Camera from "$lib/components/camera.svelte";
  import Notification from "$lib/components/notification.svelte";
  import SettingsCard from "$lib/components/settings-card.svelte";
  import StatsCard from "$lib/components/stats-card.svelte";
  import StatusCard from "$lib/components/status-card.svelte";
  import { notificationStore } from "$lib/stores/notifications.svelte";
  import { i18n } from "$lib/stores/i18n.svelte";
  import { onMount } from "svelte";

  let mounted = $state(false);

  onMount(() => {
    mounted = true;

    // Request notification permission after a brief delay
    // Gives user time to see the app before the browser prompt
    setTimeout(async () => {
      if (notificationStore.browserPermission === "default") {
        await notificationStore.requestPermission();
      }
    }, 2000);
  });
</script>

<Notification />

<main class="min-h-screen p-4 pt-8 md:p-8 md:pt-12">
  <div class="max-w-6xl mx-auto">
    <header class="text-center mb-8 md:mb-12">
      <div class="inline-flex items-center gap-3 mb-4">
        <div
          class="w-12 h-12 rounded-xl bg-linear-to-br from-back-400 to-back-600 flex items-center justify-center shadow-lg shadow-back-500/30"
        >
          <svg
            class="w-7 h-7 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M9 8H15C15.5 8 16 8.5 16 9V14C16 14.5 15.5 15 15 15H14V22H10V15H9C8.5 15 8 14.5 8 14V9C8 8.5 8.5 8 9 8Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1
          class="font-display text-4xl md:text-5xl font-bold bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent"
        >
          BackTrack
        </h1>
      </div>
      <p class="text-white/50 font-body text-lg max-w-md mx-auto">
        {i18n.t("appSubtitle")}
      </p>
    </header>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        {#if mounted}
          <Camera />
        {:else}
          <div class="aspect-4/3 bg-black/50 rounded-2xl flex items-center justify-center">
            <div
              class="w-12 h-12 border-4 border-back-500 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        {/if}

        <div class="glass rounded-2xl p-5 border border-white/10">
          <h3 class="font-display font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span>💡</span>
            {i18n.t("quickTips")}
          </h3>
          <ul class="space-y-2 text-white/50 text-sm font-body">
            <li class="flex items-start gap-2">
              <span class="text-back-400">•</span>
              <span>{i18n.t("tip1")}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-back-400">•</span>
              <span>{i18n.t("tip2")}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-back-400">•</span>
              <span>{i18n.t("tip3")}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-back-400">•</span>
              <span>{i18n.t("tip4")}</span>
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
            <span>🔒</span>
            {i18n.t("privacyFirst")}
          </h3>
          <p class="text-white/40 text-sm font-body">
            {i18n.t("privacyDesc")}
          </p>
        </div>

        <div class="glass rounded-2xl p-5 border border-warn-500/20">
          <h3 class="font-display font-semibold text-warn-400 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            {i18n.t("keepTabVisible")}
          </h3>
          <p class="text-white/40 text-sm font-body">
            {i18n.t("keepTabDesc")}
          </p>
        </div>
      </div>
    </div>

    <footer class="mt-12 text-center">
      <p class="text-white/30 text-sm font-body">
        {i18n.t("footerText")}
      </p>
      <a
        href="https://github.com/ohgree/back-track"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 mt-3 text-white/40 hover:text-white/70 transition-colors text-sm font-body"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
        <span>ohgree/back-track</span>
      </a>
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
