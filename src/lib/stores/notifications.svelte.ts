// Notification state management

export const NotificationType = {
  WARNING: "warning",
  DANGER: "danger",
  SUCCESS: "success",
  INFO: "info",
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: number;
  message: string;
  type: NotificationTypeValue;
  timestamp: number;
  exiting: boolean;
}

interface NotificationStore {
  readonly notifications: Notification[];
  readonly browserPermission: NotificationPermission | "default";
  requestPermission(): Promise<NotificationPermission | "denied">;
  add(message: string, type?: NotificationTypeValue, duration?: number): number;
  remove(id: number): void;
  clear(): void;
  sendBrowserNotification(message: string, type: NotificationTypeValue): void;
}

let notifications = $state<Notification[]>([]);
let notificationId = 0;

// Initialize with actual browser permission if available
const getInitialPermission = (): NotificationPermission | "default" => {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "default";
};

let browserPermission = $state<NotificationPermission | "default">(getInitialPermission());

// Sync permission state on client-side hydration
if (typeof window !== "undefined") {
  // Re-check permission in case it was set during SSR
  setTimeout(() => {
    if ("Notification" in window) {
      browserPermission = Notification.permission;
    }
  }, 0);
}

export const notificationStore: NotificationStore = {
  get notifications() {
    return notifications;
  },
  get browserPermission() {
    return browserPermission;
  },

  async requestPermission(): Promise<NotificationPermission | "denied"> {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      browserPermission = permission;
      return permission;
    }
    return "denied";
  },

  add(
    message: string,
    type: NotificationTypeValue = NotificationType.WARNING,
    duration = 5000
  ): number {
    const id = ++notificationId;
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
      exiting: false,
    };

    notifications = [...notifications, notification];

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    // Always send browser notification for warnings/dangers when permission is granted
    // The browser will handle showing it appropriately based on focus state
    if (
      browserPermission === "granted" &&
      (type === NotificationType.WARNING || type === NotificationType.DANGER)
    ) {
      this.sendBrowserNotification(message, type);
    }

    return id;
  },

  remove(id: number): void {
    notifications = notifications.map((n) => (n.id === id ? { ...n, exiting: true } : n));

    setTimeout(() => {
      notifications = notifications.filter((n) => n.id !== id);
    }, 300);
  },

  clear(): void {
    notifications = [];
  },

  sendBrowserNotification(message: string, type: NotificationTypeValue): void {
    if ("Notification" in window && browserPermission === "granted") {
      const icon =
        type === NotificationType.DANGER
          ? "🚨"
          : type === NotificationType.WARNING
            ? "⚠️"
            : type === NotificationType.SUCCESS
              ? "✅"
              : "ℹ️";

      // Use unique tag per notification so new ones always appear
      // even if previous notification wasn't dismissed
      new Notification("BackTrack", {
        body: `${icon} ${message}`,
        icon: "/favicon.svg",
        tag: `posture-alert-${Date.now()}`,
      });
    }
  },
};
