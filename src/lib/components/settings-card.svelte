<script lang="ts">
  import { postureStore } from "../stores/posture.svelte";
  import { notificationStore, NotificationType } from "../stores/notifications.svelte";
  import { i18n, type Locale } from "../stores/i18n.svelte";

  let showSettings = $state(false);

  async function requestNotificationPermission(): Promise<void> {
    await notificationStore.requestPermission();
  }

  function testNotification(): void {
    // Send both in-app and browser notification for testing
    notificationStore.add(i18n.t("testNotification"), NotificationType.SUCCESS);
    // Force browser notification even if tab is visible
    notificationStore.sendBrowserNotification(i18n.t("testNotification"), NotificationType.SUCCESS);
  }

  function setLocale(locale: Locale): void {
    i18n.setLocale(locale);
  }
</script>

<div class="glass rounded-2xl border border-white/10 overflow-hidden">
  <button
    onclick={() => (showSettings = !showSettings)}
    class="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
  >
    <div class="flex items-center gap-3">
      <span class="text-xl">⚙️</span>
      <span class="font-display font-semibold text-white">{i18n.t("settings")}</span>
    </div>
    <svg
      class="w-5 h-5 text-white/50 transition-transform duration-300 {showSettings
        ? 'rotate-180'
        : ''}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if showSettings}
    <div class="p-4 space-y-4 border-t border-white/10">
      <!-- Language selector -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-white text-sm font-body">{i18n.t("language")}</p>
        </div>
        <div class="flex items-center gap-1">
          <button
            onclick={() => setLocale("en")}
            class="px-3 py-1.5 text-sm rounded-lg transition-colors {i18n.locale === 'en'
              ? 'bg-back-500/30 text-back-400'
              : 'bg-white/10 text-white/60 hover:bg-white/20'}"
          >
            {i18n.t("english")}
          </button>
          <button
            onclick={() => setLocale("ko")}
            class="px-3 py-1.5 text-sm rounded-lg transition-colors {i18n.locale === 'ko'
              ? 'bg-back-500/30 text-back-400'
              : 'bg-white/10 text-white/60 hover:bg-white/20'}"
          >
            {i18n.t("korean")}
          </button>
        </div>
      </div>

      <!-- Recalibrate button -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-white text-sm font-body">{i18n.t("postureCalibration")}</p>
          <p class="text-white/40 text-xs">
            {#if postureStore.isCalibrated}
              {i18n.t("calibrated")}
            {:else}
              {i18n.t("calibrating")}
            {/if}
          </p>
        </div>
        <button
          onclick={() => postureStore.resetCalibration()}
          class="px-3 py-1.5 bg-warn-500/20 hover:bg-warn-500/30 text-warn-400 text-sm rounded-lg transition-colors"
        >
          {i18n.t("recalibrate")}
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <p class="text-white text-sm font-body">{i18n.t("browserNotifications")}</p>
          <p class="text-white/40 text-xs">{i18n.t("notificationDesc")}</p>
        </div>
        {#if notificationStore.browserPermission === "granted"}
          <div class="flex items-center gap-2">
            <span class="text-back-400 text-sm">{i18n.t("enabled")}</span>
            <button
              onclick={testNotification}
              class="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs rounded transition-colors"
            >
              {i18n.t("test")}
            </button>
          </div>
        {:else if notificationStore.browserPermission === "denied"}
          <span class="text-danger-400 text-sm">{i18n.t("blocked")}</span>
        {:else}
          <button
            onclick={requestNotificationPermission}
            class="px-3 py-1.5 bg-back-500/20 hover:bg-back-500/30 text-back-400 text-sm rounded-lg transition-colors"
          >
            {i18n.t("enable")}
          </button>
        {/if}
      </div>

      <div class="space-y-4">
        <p class="text-white/60 text-xs uppercase tracking-wider font-display">
          {i18n.t("sensitivity")}
        </p>

        <div>
          <div class="flex justify-between mb-1">
            <span class="text-white/70 text-sm font-body">{i18n.t("minDistance")}</span>
            <span class="text-white/50 text-sm font-mono"
              >{postureStore.thresholds.minDistance}</span
            >
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
            <span>{i18n.t("closer")}</span>
            <span>{i18n.t("further")}</span>
          </div>
          {#if postureStore.thresholds.minDistance < 50}
            <p class="text-warn-400 text-xs mt-2 flex items-start gap-1.5">
              <span>⚠️</span>
              <span>{i18n.t("distanceWarning")}</span>
            </p>
          {/if}
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <span class="text-white/70 text-sm font-body">{i18n.t("maxLeanAngle")}</span>
            <span class="text-white/50 text-sm font-mono"
              >{postureStore.thresholds.maxLeanAngle}</span
            >
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
            <span>{i18n.t("strict")}</span>
            <span>{i18n.t("relaxed")}</span>
          </div>
          {#if postureStore.thresholds.maxLeanAngle > 12}
            <p class="text-warn-400 text-xs mt-2 flex items-start gap-1.5">
              <span>⚠️</span>
              <span>{i18n.t("leanWarning")}</span>
            </p>
          {/if}
        </div>

        <div>
          <div class="flex justify-between mb-1">
            <span class="text-white/70 text-sm font-body">{i18n.t("maxSlouchAngle")}</span>
            <span class="text-white/50 text-sm font-mono"
              >{postureStore.thresholds.maxSlouchAngle}</span
            >
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
            <span>{i18n.t("strict")}</span>
            <span>{i18n.t("relaxed")}</span>
          </div>
          {#if postureStore.thresholds.maxSlouchAngle > 15}
            <p class="text-warn-400 text-xs mt-2 flex items-start gap-1.5">
              <span>⚠️</span>
              <span>{i18n.t("slouchWarning")}</span>
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
