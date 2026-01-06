<script lang="ts">
  import {
    notificationStore,
    NotificationType,
    type NotificationTypeValue,
  } from "../stores/notifications.svelte";

  function getIcon(type: NotificationTypeValue): string {
    switch (type) {
      case NotificationType.DANGER:
        return "🚨";
      case NotificationType.WARNING:
        return "⚠️";
      case NotificationType.SUCCESS:
        return "✅";
      default:
        return "ℹ️";
    }
  }

  function getColors(type: NotificationTypeValue): string {
    switch (type) {
      case NotificationType.DANGER:
        return "bg-danger-500/20 border-danger-500/50 text-danger-100";
      case NotificationType.WARNING:
        return "bg-warn-500/20 border-warn-500/50 text-warn-100";
      case NotificationType.SUCCESS:
        return "bg-back-500/20 border-back-500/50 text-back-100";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
  {#each notificationStore.notifications as notification (notification.id)}
    <div
      class="p-4 rounded-xl border backdrop-blur-lg shadow-xl transition-all duration-300 {getColors(
        notification.type
      )} {notification.exiting ? 'notification-exit' : 'notification-enter'}"
    >
      <div class="flex items-start gap-3">
        <span class="text-xl flex-shrink-0">{getIcon(notification.type)}</span>
        <div class="flex-1">
          <p class="font-body text-sm">{notification.message}</p>
          <p class="text-xs opacity-60 mt-1 font-mono">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onclick={() => notificationStore.remove(notification.id)}
          class="text-white/50 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>
