<script lang="ts">
  import { i18n } from "../stores/i18n.svelte";
  import { PostureStatus, postureStore } from "../stores/posture.svelte";

  // Individual metric status
  const distanceStatus = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) return "neutral";
    if (postureStore.distance < postureStore.thresholds.minDistance) {
      return postureStore.distance < postureStore.thresholds.minDistance * 0.7
        ? "danger"
        : "warning";
    }
    return "good";
  });

  const leanStatus = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) return "neutral";
    const absLean = Math.abs(postureStore.leanAngle);
    if (absLean > postureStore.thresholds.maxLeanAngle) {
      return absLean > postureStore.thresholds.maxLeanAngle * 1.5 ? "danger" : "warning";
    }
    return "good";
  });

  const slouchStatus = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) return "neutral";
    if (postureStore.shoulderAngle > postureStore.thresholds.maxSlouchAngle) {
      return postureStore.shoulderAngle > postureStore.thresholds.maxSlouchAngle * 1.5
        ? "danger"
        : "warning";
    }
    return "good";
  });

  // Get color class for a status
  function getStatusColor(status: string): string {
    switch (status) {
      case "good":
        return "text-back-400";
      case "warning":
        return "text-warn-400";
      case "danger":
        return "text-danger-400";
      default:
        return "text-white";
    }
  }

  // Build list of all active issues
  type IssueType = "searching" | "perfect" | "distance" | "lean" | "slouch";

  const activeIssues = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) {
      return [{ label: i18n.t("searching"), type: "searching" as IssueType }];
    }

    const issues: { label: string; type: IssueType }[] = [];

    if (distanceStatus !== "good") {
      issues.push({ label: i18n.t("tooClose"), type: "distance" });
    }
    if (leanStatus !== "good") {
      const label = postureStore.leanAngle > 0 ? i18n.t("leaningRight") : i18n.t("leaningLeft");
      issues.push({ label, type: "lean" });
    }
    if (slouchStatus !== "good") {
      issues.push({ label: i18n.t("slouching"), type: "slouch" });
    }

    if (issues.length === 0) {
      return [{ label: i18n.t("perfectPosture"), type: "perfect" as IssueType }];
    }

    return issues;
  });

  // Overall status for card styling
  const overallStatus = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) return "neutral";
    if (distanceStatus === "danger" || leanStatus === "danger" || slouchStatus === "danger")
      return "danger";
    if (distanceStatus === "warning" || leanStatus === "warning" || slouchStatus === "warning")
      return "warning";
    return "good";
  });

  const cardStyles = $derived.by(() => {
    switch (overallStatus) {
      case "good":
        return {
          borderColor: "border-back-500/30",
          glowColor: "shadow-back-500/30",
          labelColor: "text-back-400",
          iconColor: "#4ade80",
        };
      case "warning":
        return {
          borderColor: "border-warn-500/30",
          glowColor: "shadow-warn-500/30",
          labelColor: "text-warn-400",
          iconColor: "#fbbf24",
        };
      case "danger":
        return {
          borderColor: "border-danger-500/30",
          glowColor: "shadow-danger-500/30",
          labelColor: "text-danger-400",
          iconColor: "#f87171",
        };
      default:
        return {
          borderColor: "border-gray-500/30",
          glowColor: "shadow-gray-500/30",
          labelColor: "text-gray-400",
          iconColor: "#9ca3af",
        };
    }
  });
</script>

<div
  class="glass rounded-2xl p-6 {cardStyles.borderColor} border transition-all duration-500 shadow-lg {cardStyles.glowColor}"
>
  <div class="flex items-center gap-4">
    <div class="status-pulse flex gap-2 shrink-0">
      {#each activeIssues as issue (issue.type)}
        {#if issue.type === "searching"}
          <!-- Eye/Search icon -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
          </svg>
        {:else if issue.type === "perfect"}
          <!-- Checkmark/Star icon -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        {:else if issue.type === "distance"}
          <!-- Arrows pointing inward (too close) -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 8l4-4-4-4" />
            <path d="M21 4h-7" />
            <path d="M7 8L3 4l4-4" />
            <path d="M3 4h7" />
            <rect x="8" y="12" width="8" height="8" rx="1" />
          </svg>
        {:else if issue.type === "lean"}
          <!-- Abstract tilt indicator -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="transform: scaleX({postureStore.leanAngle > 0 ? -1 : 1})"
          >
            <!-- Tilted bar -->
            <path d="M4 14 L20 8" />
            <!-- Level reference (dashed) -->
            <path d="M4 11 L20 11" stroke-dasharray="2 2" opacity="0.4" />
            <!-- End caps -->
            <circle cx="4" cy="14" r="2" fill={cardStyles.iconColor} />
            <circle cx="20" cy="8" r="2" fill={cardStyles.iconColor} />
            <!-- Center pivot -->
            <circle cx="12" cy="11" r="1.5" />
            <path d="M12 12.5 L12 16" />
          </svg>
        {:else if issue.type === "slouch"}
          <!-- Slouching person icon - clear side profile -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- Head pushed forward -->
            <circle cx="7" cy="6" r="2.5" />
            <!-- Neck leaning forward -->
            <path d="M9 8 L12 10" />
            <!-- Curved upper back (the slouch) -->
            <path d="M12 10 Q16 12 15 16" />
            <!-- Lower back to hips -->
            <path d="M15 16 L14 21" />
            <!-- Chair/seat reference -->
            <path d="M10 21 H18" />
            <!-- Arm hanging -->
            <path d="M12 11 Q10 14 8 16" />
          </svg>
        {/if}
      {/each}
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="font-display text-lg font-semibold {cardStyles.labelColor} truncate">
        {activeIssues.map((i) => i.label).join(", ")}
      </h3>
      <p class="text-white/50 text-sm font-body mt-1">
        {i18n.t("confidence")}: {postureStore.confidence}%
      </p>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-4 mt-6">
    <div class="text-center">
      <p class="text-2xl font-display font-bold {getStatusColor(distanceStatus)}">
        {postureStore.distance}<span class="text-sm opacity-50">cm</span>
      </p>
      <p class="text-xs text-white/40 font-body mt-1">{i18n.t("distance")}</p>
    </div>
    <div class="text-center">
      <p class="text-2xl font-display font-bold {getStatusColor(leanStatus)}">
        {postureStore.leanAngle.toFixed(1)}°
      </p>
      <p class="text-xs text-white/40 font-body mt-1">{i18n.t("lean")}</p>
    </div>
    <div class="text-center">
      <p class="text-2xl font-display font-bold {getStatusColor(slouchStatus)}">
        {postureStore.shoulderAngle}°
      </p>
      <p class="text-xs text-white/40 font-body mt-1">{i18n.t("slouch")}</p>
    </div>
  </div>
</div>
