<script lang="ts">
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
      return absLean > postureStore.thresholds.maxLeanAngle * 1.5
        ? "danger"
        : "warning";
    }
    return "good";
  });

  const slouchStatus = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) return "neutral";
    if (postureStore.shoulderAngle > postureStore.thresholds.maxSlouchAngle) {
      return postureStore.shoulderAngle >
        postureStore.thresholds.maxSlouchAngle * 1.5
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
      return [{ label: "Searching...", type: "searching" as IssueType }];
    }

    const issues: { label: string; type: IssueType }[] = [];

    if (distanceStatus !== "good") {
      issues.push({ label: "Too Close", type: "distance" });
    }
    if (leanStatus !== "good") {
      const direction = postureStore.leanAngle > 0 ? "Right" : "Left";
      issues.push({ label: `Leaning ${direction}`, type: "lean" });
    }
    if (slouchStatus !== "good") {
      issues.push({ label: "Slouching", type: "slouch" });
    }

    if (issues.length === 0) {
      return [{ label: "Perfect Posture", type: "perfect" as IssueType }];
    }

    return issues;
  });

  // Overall status for card styling
  const overallStatus = $derived.by(() => {
    if (postureStore.status === PostureStatus.NOT_DETECTED) return "neutral";
    if (
      distanceStatus === "danger" ||
      leanStatus === "danger" ||
      slouchStatus === "danger"
    )
      return "danger";
    if (
      distanceStatus === "warning" ||
      leanStatus === "warning" ||
      slouchStatus === "warning"
    )
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
      {#each activeIssues as issue}
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
          <!-- Tilted balance/level icon -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 2v4" />
            <path d="M4 10l8-2 8 2" />
            <circle cx="4" cy="14" r="2" />
            <circle cx="20" cy="10" r="2" />
            <path d="M4 16v4" />
            <path d="M20 12v8" />
          </svg>
        {:else if issue.type === "slouch"}
          <!-- Curved spine/posture icon -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke={cardStyles.iconColor}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="4" r="2" />
            <path d="M12 6c0 0 0 4-2 8s-2 6-2 6" />
            <path d="M16 14c-1-2-2-4-4-4" />
            <path d="M8 20h4" />
          </svg>
        {/if}
      {/each}
    </div>
    <div class="flex-1 min-w-0">
      <h3
        class="font-display text-lg font-semibold {cardStyles.labelColor} truncate"
      >
        {activeIssues.map((i) => i.label).join(", ")}
      </h3>
      <p class="text-white/50 text-sm font-body mt-1">
        Confidence: {postureStore.confidence}%
      </p>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-4 mt-6">
    <div class="text-center">
      <p
        class="text-2xl font-display font-bold {getStatusColor(distanceStatus)}"
      >
        {postureStore.distance}<span class="text-sm opacity-50">cm</span>
      </p>
      <p class="text-xs text-white/40 font-body mt-1">Distance</p>
    </div>
    <div class="text-center">
      <p class="text-2xl font-display font-bold {getStatusColor(leanStatus)}">
        {postureStore.leanAngle.toFixed(1)}°
      </p>
      <p class="text-xs text-white/40 font-body mt-1">Lean</p>
    </div>
    <div class="text-center">
      <p class="text-2xl font-display font-bold {getStatusColor(slouchStatus)}">
        {postureStore.shoulderAngle}°
      </p>
      <p class="text-xs text-white/40 font-body mt-1">Slouch</p>
    </div>
  </div>
</div>
