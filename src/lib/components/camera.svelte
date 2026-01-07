<script lang="ts">
  import type { PoseLandmarker } from "@mediapipe/tasks-vision";
  import { onDestroy, onMount } from "svelte";
  import { i18n } from "../stores/i18n.svelte";
  import { notificationStore, NotificationType } from "../stores/notifications.svelte";
  import { PostureStatus, postureStore } from "../stores/posture.svelte";
  import {
    analyzePose,
    getNoseToShoulderRatio,
    type Landmark,
    type PoseAnalysis,
  } from "../utils/pose-analyzer";

  let videoElement = $state<HTMLVideoElement | null>(null);
  let canvasElement = $state<HTMLCanvasElement | null>(null);
  let poseLandmarker = $state<PoseLandmarker | null>(null);
  let animationFrameId: number | null = null;
  let backgroundIntervalId: ReturnType<typeof setInterval> | null = null;
  let lastNotificationTime = 0;
  let lastStatsUpdate = Date.now();

  const NOTIFICATION_COOLDOWN = 10000;
  const CALIBRATION_TIME = 3000; // 3 seconds of good tracking to calibrate
  const SMOOTHING_FACTOR = 0.15; // Lower = smoother but slower response
  const BACKGROUND_INTERVAL = 1000; // 1 second interval when tab is hidden

  // Smoothed values for display
  let smoothedDistance = 0;
  let smoothedLeanAngle = 0;
  let smoothedSlouchAngle = 0;

  // Background/visibility state
  let isPageVisible = $state(true);
  let webLock: { release: () => void } | null = null;

  function smoothValue(current: number, target: number, factor: number = SMOOTHING_FACTOR): number {
    return current + (target - current) * factor;
  }

  interface Props {
    showSkeleton?: boolean;
  }

  let { showSkeleton = true }: Props = $props();

  // View mode state
  let calibrationStartTime = $state<number | null>(null);
  let showAbstractView = $state(false);
  let calibrationTick = $state(0); // Reactive tick for progress bar animation
  let calibrationTickInterval: ReturnType<typeof setInterval> | null = null;

  // Sync showAbstractView with calibration state
  $effect(() => {
    if (!postureStore.isCalibrated) {
      showAbstractView = false;
      calibrationStartTime = null;
    }
  });

  // Start/stop calibration tick interval based on calibration state
  $effect(() => {
    if (calibrationStartTime && !postureStore.isCalibrated) {
      // Start ticking for progress bar animation
      calibrationTickInterval = setInterval(() => {
        calibrationTick++;
      }, 50);
    } else if (calibrationTickInterval) {
      clearInterval(calibrationTickInterval);
      calibrationTickInterval = null;
    }
  });

  // Handle visibility changes - switch between RAF and setInterval
  function handleVisibilityChange(): void {
    isPageVisible = !document.hidden;

    if (document.hidden) {
      // Tab is hidden - switch to interval-based detection
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // Start background interval for continued detection
      if (!backgroundIntervalId && poseLandmarker) {
        backgroundIntervalId = setInterval(() => {
          detectPoseOnce();
        }, BACKGROUND_INTERVAL);
      }

      // Acquire web lock to prevent tab suspension
      acquireWebLock();
    } else {
      // Tab is visible - use requestAnimationFrame
      if (backgroundIntervalId) {
        clearInterval(backgroundIntervalId);
        backgroundIntervalId = null;
      }

      // Release web lock
      releaseWebLock();

      // Restart RAF-based detection
      if (!animationFrameId && poseLandmarker) {
        detectPose();
      }
    }
  }

  // Web Lock API to prevent tab suspension
  async function acquireWebLock(): Promise<void> {
    if ("locks" in navigator && !webLock) {
      try {
        await navigator.locks.request(
          "posture-tracking",
          { mode: "exclusive", ifAvailable: true },
          async (lock) => {
            if (lock) {
              // Hold the lock while we're in background
              return new Promise<void>((resolve) => {
                webLock = { release: resolve };
              });
            }
          }
        );
      } catch {
        // Web Locks not fully supported, continue without
      }
    }
  }

  function releaseWebLock(): void {
    if (webLock) {
      webLock.release();
      webLock = null;
    }
  }

  onMount(async () => {
    // Set up visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    await initCamera();
    await initPoseDetection();
  });

  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (backgroundIntervalId) {
      clearInterval(backgroundIntervalId);
    }
    if (calibrationTickInterval) {
      clearInterval(calibrationTickInterval);
    }

    // Clean up visibility listener
    document.removeEventListener("visibilitychange", handleVisibilityChange);

    // Release web lock
    releaseWebLock();

    if (videoElement?.srcObject) {
      (videoElement.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    }
  });

  async function initCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      notificationStore.add(i18n.t("cameraAccessDenied"), NotificationType.DANGER, 0);
    }
  }

  async function initPoseDetection(): Promise<void> {
    try {
      const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      postureStore.isTracking = true;
      postureStore.startSession();
      detectPose();
    } catch (error) {
      console.error("Failed to initialize pose detection:", error);
      notificationStore.add(i18n.t("poseDetectionFailed"), NotificationType.DANGER);
    }
  }

  // Core detection logic - shared between RAF and interval modes
  function processPoseResults(): void {
    if (!videoElement || !poseLandmarker || videoElement.readyState < 2) {
      return;
    }

    const results = poseLandmarker.detectForVideo(videoElement, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks: Landmark[] = results.landmarks[0];
      const analysis = analyzePose(landmarks, postureStore.thresholds, postureStore.slouchBaseline);

      // Smooth the numerical values for less jittery display
      smoothedDistance = smoothValue(smoothedDistance, analysis.distance);
      smoothedLeanAngle = smoothValue(smoothedLeanAngle, analysis.leanAngle);
      smoothedSlouchAngle = smoothValue(smoothedSlouchAngle, analysis.shoulderAngle);

      postureStore.status = analysis.status;
      postureStore.confidence = analysis.confidence;
      postureStore.distance = Math.round(smoothedDistance);
      postureStore.leanAngle = Math.round(smoothedLeanAngle * 10) / 10;
      postureStore.shoulderAngle = Math.round(smoothedSlouchAngle * 10) / 10;

      // Handle calibration
      if (!postureStore.isCalibrated && postureStore.confidence > 70) {
        if (!calibrationStartTime) {
          calibrationStartTime = Date.now();
        } else if (Date.now() - calibrationStartTime > CALIBRATION_TIME) {
          // Capture the slouch baseline from current "good" posture
          const baseline = getNoseToShoulderRatio(landmarks);
          if (baseline !== null) {
            postureStore.calibrateSlouchBaseline(baseline);
          }
          showAbstractView = true;
          notificationStore.add(i18n.t("calibrationComplete"), NotificationType.INFO);
        }
      } else if (!postureStore.isCalibrated) {
        calibrationStartTime = null;
      }

      const now = Date.now();
      const deltaSeconds = (now - lastStatsUpdate) / 1000;
      lastStatsUpdate = now;
      postureStore.updateStats(deltaSeconds, analysis.status === PostureStatus.GOOD);

      if (
        analysis.status !== PostureStatus.GOOD &&
        analysis.status !== PostureStatus.NOT_DETECTED
      ) {
        postureStore.badPostureDuration += deltaSeconds;

        if (
          postureStore.badPostureDuration > 5 &&
          now - lastNotificationTime > NOTIFICATION_COOLDOWN
        ) {
          const issue = analysis.issues[0];
          if (issue) {
            // Translate the issue message
            let message: string;
            if (issue.type === "too_close") {
              message = `${i18n.t("tooCloseNotification")} (${analysis.distance}cm)`;
            } else if (issue.type === "leaning") {
              const direction =
                analysis.leanAngle > 0
                  ? i18n.t("leaningRightNotification")
                  : i18n.t("leaningLeftNotification");
              message = `${direction} (${Math.abs(analysis.leanAngle)}°)`;
            } else {
              message = `${i18n.t("slouchingNotification")} (${analysis.shoulderAngle}°)`;
            }

            notificationStore.add(
              message,
              issue.severity === "danger" ? NotificationType.DANGER : NotificationType.WARNING
            );
            postureStore.incrementAlerts();
            lastNotificationTime = now;
          }
        }
      } else {
        postureStore.badPostureDuration = 0;
        postureStore.lastGoodPosture = now;
      }

      if (showSkeleton && canvasElement && !showAbstractView && isPageVisible) {
        drawSkeleton(landmarks, analysis);
      }
    } else {
      postureStore.status = PostureStatus.NOT_DETECTED;
      postureStore.confidence = 0;
    }
  }

  // Single pose detection (for background interval)
  function detectPoseOnce(): void {
    processPoseResults();
  }

  // Continuous pose detection using requestAnimationFrame
  function detectPose(): void {
    processPoseResults();
    animationFrameId = requestAnimationFrame(detectPose);
  }

  function drawSkeleton(landmarks: Landmark[], analysis: PoseAnalysis): void {
    if (!canvasElement) return;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    const width = canvasElement.width;
    const height = canvasElement.height;

    ctx.clearRect(0, 0, width, height);

    const getColor = (): string => {
      switch (analysis.status) {
        case PostureStatus.GOOD:
          return "#22c55e";
        case PostureStatus.LEANING:
          return "#f59e0b";
        case PostureStatus.TOO_CLOSE:
          return "#f59e0b";
        case PostureStatus.SLOUCHING:
          return "#ef4444";
        default:
          return "#64748b";
      }
    };

    const color = getColor();

    const connections: [number, number][] = [
      [11, 12],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 23],
      [12, 24],
      [23, 24],
      [0, 11],
      [0, 12],
    ];

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    connections.forEach(([i, j]) => {
      const a = landmarks[i];
      const b = landmarks[j];
      if (a && b && (a.visibility ?? 0) > 0.5 && (b.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }
    });

    const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24];
    keyPoints.forEach((i) => {
      const point = landmarks[i];
      if (point && (point.visibility ?? 0) > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  function toggleView(): void {
    if (postureStore.isCalibrated) {
      showAbstractView = !showAbstractView;
    }
  }

  // Compute status color
  const statusColor = $derived.by(() => {
    switch (postureStore.status) {
      case PostureStatus.GOOD:
        return { primary: "#22c55e", glow: "rgba(34, 197, 94, 0.4)" };
      case PostureStatus.LEANING:
      case PostureStatus.TOO_CLOSE:
        return { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" };
      case PostureStatus.SLOUCHING:
        return { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" };
      default:
        return { primary: "#64748b", glow: "rgba(100, 116, 139, 0.3)" };
    }
  });

  // Calibration progress (0-100)
  // Uses calibrationTick to force reactivity updates
  const calibrationProgress = $derived.by(() => {
    // Reference calibrationTick to make this reactive
    void calibrationTick;
    if (postureStore.isCalibrated) return 100;
    if (!calibrationStartTime) return 0;
    return Math.min(100, ((Date.now() - calibrationStartTime) / CALIBRATION_TIME) * 100);
  });

  // Calibration step states
  const isDetected = $derived(postureStore.confidence > 70);
  const step1Done = $derived(postureStore.confidence > 0);
  const step2Done = $derived(postureStore.confidence > 70);
  const step3Done = $derived(calibrationProgress >= 100);
</script>

<div class="relative w-full aspect-4/3 bg-black/50 rounded-2xl overflow-hidden">
  <!-- Camera feed (hidden when in abstract view) -->
  <video
    bind:this={videoElement}
    class="absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-500"
    class:opacity-0={showAbstractView}
    autoplay
    playsinline
    muted
  ></video>

  <!-- Skeleton canvas (only shown in camera view) -->
  <canvas
    bind:this={canvasElement}
    width="640"
    height="480"
    class="absolute inset-0 w-full h-full scale-x-[-1] transition-opacity duration-500"
    class:opacity-0={showAbstractView}
  ></canvas>

  <!-- Abstract visualization - Top-down view -->
  {#if showAbstractView && postureStore.isTracking}
    {@const distanceOffset = Math.max(0, Math.min(80, (60 - postureStore.distance) * 2))}
    {@const slouchOffset = postureStore.shoulderAngle * 1.5}
    <div
      class="absolute inset-0 flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-950"
    >
      <!-- Animated background grid -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
                class="text-white/50"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <!-- Top-down visualization -->
      <svg width="320" height="300" viewBox="0 0 320 300" class="relative z-10">
        <defs>
          <!-- Glow filter -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Monitor/Screen at top -->
        <g transform="translate(160, 35)">
          <!-- Monitor base -->
          <rect
            x="-70"
            y="-15"
            width="140"
            height="30"
            rx="4"
            fill="none"
            stroke="#475569"
            stroke-width="2"
          />
          <!-- Screen -->
          <rect
            x="-60"
            y="-10"
            width="120"
            height="20"
            rx="2"
            fill="#1e293b"
            stroke="#64748b"
            stroke-width="1"
          />
          <!-- Screen shine -->
          <rect x="-55" y="-7" width="40" height="4" rx="1" fill="#334155" opacity="0.5" />
          <text
            x="0"
            y="40"
            text-anchor="middle"
            fill="#64748b"
            font-size="10"
            font-family="system-ui">{i18n.t("monitor")}</text
          >
        </g>

        <!-- Distance reference lines -->
        <g opacity="0.3">
          <line
            x1="60"
            y1="80"
            x2="60"
            y2="250"
            stroke="#475569"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
          <line
            x1="260"
            y1="80"
            x2="260"
            y2="250"
            stroke="#475569"
            stroke-width="1"
            stroke-dasharray="4,4"
          />
        </g>

        <!-- Ideal position zone -->
        <ellipse cx="160" cy="200" rx="60" ry="25" fill={statusColor.glow} opacity="0.2" />

        <!-- Person (top-down view) -->
        <g
          transform="translate(160, {180 - distanceOffset}) rotate({postureStore.leanAngle}, 0, 20)"
          filter="url(#glow)"
        >
          <!-- Shoulders (curved line from above) -->
          <path
            d="M -50 20 Q -50 35 0 40 Q 50 35 50 20"
            fill="none"
            stroke={statusColor.primary}
            stroke-width="8"
            stroke-linecap="round"
            class="transition-all duration-300"
          />

          <!-- Shoulder joints -->
          <circle
            cx="-45"
            cy="22"
            r="8"
            fill={statusColor.primary}
            class="transition-all duration-300"
          />
          <circle
            cx="45"
            cy="22"
            r="8"
            fill={statusColor.primary}
            class="transition-all duration-300"
          />

          <!-- Neck -->
          <ellipse
            cx="0"
            cy={5 - slouchOffset}
            rx="12"
            ry="8"
            fill={statusColor.primary}
            opacity="0.6"
          />

          <!-- Head (from above) -->
          <ellipse
            cx="0"
            cy={-15 - slouchOffset}
            rx="22"
            ry="18"
            fill="none"
            stroke={statusColor.primary}
            stroke-width="3"
          />

          <!-- Head fill -->
          <ellipse
            cx="0"
            cy={-15 - slouchOffset}
            rx="18"
            ry="14"
            fill={statusColor.primary}
            opacity="0.3"
          />

          <!-- Face direction indicator (nose) -->
          <ellipse cx="0" cy={-28 - slouchOffset} rx="5" ry="4" fill={statusColor.primary} />
        </g>

        <!-- Distance indicator line -->
        <g transform="translate(280, 100)">
          <line x1="0" y1="0" x2="0" y2="120" stroke="#475569" stroke-width="2" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#475569" stroke-width="2" />
          <line x1="-5" y1="120" x2="5" y2="120" stroke="#475569" stroke-width="2" />
          <!-- Current distance marker -->
          <line
            x1="-8"
            y1={120 - distanceOffset * 1.5}
            x2="8"
            y2={120 - distanceOffset * 1.5}
            stroke={statusColor.primary}
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>

        <!-- Labels -->
        <text
          x="280"
          y="85"
          text-anchor="middle"
          fill="#64748b"
          font-size="9"
          font-family="system-ui">{i18n.t("distance").toUpperCase()}</text
        >
        <text
          x="280"
          y="240"
          text-anchor="middle"
          fill={statusColor.primary}
          font-size="14"
          font-weight="bold"
          font-family="monospace"
        >
          {postureStore.distance}cm
        </text>
      </svg>

      <!-- Stats overlay -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8">
        <div class="text-center">
          <div class="text-xs text-white/40 uppercase tracking-wider mb-1">{i18n.t("lean")}</div>
          <div class="text-xl font-mono font-bold" style="color: {statusColor.primary}">
            {postureStore.leanAngle > 0 ? "+" : ""}{postureStore.leanAngle.toFixed(1)}°
          </div>
        </div>
        <div class="text-center">
          <div class="text-xs text-white/40 uppercase tracking-wider mb-1">{i18n.t("slouch")}</div>
          <div class="text-xl font-mono font-bold" style="color: {statusColor.primary}">
            {postureStore.shoulderAngle > 0 ? "+" : ""}{postureStore.shoulderAngle.toFixed(1)}°
          </div>
        </div>
      </div>

      <!-- Status badge -->
      <div
        class="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300"
        style="background: {statusColor.glow}; border-color: {statusColor.primary}; color: {statusColor.primary}"
      >
        {#if postureStore.status === PostureStatus.GOOD}
          {i18n.t("goodPostureStatus")}
        {:else if postureStore.status === PostureStatus.LEANING}
          {i18n.t("leaningStatus")}
        {:else if postureStore.status === PostureStatus.TOO_CLOSE}
          {i18n.t("tooCloseStatus")}
        {:else if postureStore.status === PostureStatus.SLOUCHING}
          {i18n.t("slouchingStatus")}
        {:else}
          {i18n.t("detectingStatus")}
        {/if}
      </div>

      <!-- Confidence indicator -->
      <div class="absolute top-4 right-4 text-right">
        <div class="text-xs text-white/40 uppercase tracking-wider">{i18n.t("confidence")}</div>
        <div class="text-lg font-mono text-white/80">{postureStore.confidence}%</div>
      </div>
    </div>
  {/if}

  <!-- Loading state -->
  {#if !postureStore.isTracking}
    <div class="absolute inset-0 flex items-center justify-center bg-black/70">
      <div class="text-center">
        <div
          class="w-12 h-12 border-4 border-back-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-white/80 font-body">{i18n.t("initializingPose")}</p>
      </div>
    </div>
  {/if}

  <!-- Calibration overlay -->
  {#if postureStore.isTracking && !postureStore.isCalibrated}
    <!-- Full overlay with instructions -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Top instruction panel -->
      <div class="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/80 to-transparent">
        <div class="text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-back-500/20 border border-back-500/40 backdrop-blur-sm"
          >
            <div class="relative flex h-3 w-3">
              {#if postureStore.confidence > 70}
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-back-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-back-500"></span>
              {:else}
                <span class="relative inline-flex rounded-full h-3 w-3 bg-warn-500"></span>
              {/if}
            </div>
            <span class="text-white font-display font-semibold text-sm">
              {#if postureStore.confidence > 70}
                {i18n.t("holdStill")}
              {:else}
                {i18n.t("positionYourself")}
              {/if}
            </span>
          </div>
        </div>
      </div>

      <!-- Center frame guide -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="w-48 h-64 border-2 rounded-3xl transition-all duration-300 {isDetected
            ? 'border-back-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
            : 'border-white/30'}"
        >
          <!-- Corner markers -->
          <div
            class="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-300 {isDetected
              ? 'border-back-500'
              : 'border-white/50'}"
          ></div>
          <div
            class="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-300 {isDetected
              ? 'border-back-500'
              : 'border-white/50'}"
          ></div>
          <div
            class="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-300 {isDetected
              ? 'border-back-500'
              : 'border-white/50'}"
          ></div>
          <div
            class="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-xl transition-colors duration-300 {isDetected
              ? 'border-back-500'
              : 'border-white/50'}"
          ></div>
        </div>
      </div>

      <!-- Bottom progress panel -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 via-black/50 to-transparent"
      >
        <!-- Step indicators -->
        <div class="flex justify-center gap-2 mb-3">
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 {step1Done
                ? 'bg-back-500 text-white'
                : 'bg-white/20 text-white/50'}"
            >
              {#if step1Done}✓{:else}1{/if}
            </div>
            <span class="text-xs text-white/60 font-body">{i18n.t("cameraReady")}</span>
          </div>
          <div class="w-8 h-px bg-white/20 self-center"></div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 {step2Done
                ? 'bg-back-500 text-white'
                : 'bg-white/20 text-white/50'}"
            >
              {#if step2Done}✓{:else}2{/if}
            </div>
            <span class="text-xs text-white/60 font-body">{i18n.t("personDetected")}</span>
          </div>
          <div class="w-8 h-px bg-white/20 self-center"></div>
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 {step3Done
                ? 'bg-back-500 text-white'
                : 'bg-white/20 text-white/50'}"
            >
              3
            </div>
            <span class="text-xs text-white/60 font-body"
              >{i18n.t("calibrated").replace(" ✓", "")}</span
            >
          </div>
        </div>

        <!-- Progress bar -->
        <div class="max-w-md mx-auto">
          <div class="flex justify-between text-xs text-white/50 mb-1.5 font-body">
            <span>
              {#if !step2Done}
                {i18n.t("waitingDetection")}
              {:else if calibrationProgress < 100}
                {i18n.t("calibratingBaseline")}
              {:else}
                {i18n.t("complete")}
              {/if}
            </span>
            <span class="font-mono">{Math.round(calibrationProgress)}%</span>
          </div>
          <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-200 {step2Done
                ? 'bg-back-500'
                : 'bg-warn-500'}"
              style="width: {step2Done ? calibrationProgress : 0}%"
            ></div>
          </div>
        </div>

        <!-- Tips -->
        <div class="mt-3 text-center text-xs text-white/40 font-body">
          {i18n.t("calibrationTip")}
        </div>
      </div>
    </div>
  {/if}

  <!-- Background mode indicator -->
  {#if !isPageVisible && postureStore.isTracking}
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div
        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warn-500/20 border border-warn-500/40 backdrop-blur-sm"
      >
        <div class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-warn-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-warn-500"></span>
        </div>
        <span class="text-warn-400 text-xs font-medium">
          {i18n.t("backgroundMode") || "Background mode (limited)"}
        </span>
      </div>
    </div>
  {/if}

  <!-- View toggle button -->
  {#if postureStore.isCalibrated}
    <button
      onclick={toggleView}
      class="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 shadow-lg shadow-black/30 backdrop-blur-md transition-all duration-200 group"
      title={showAbstractView ? i18n.t("showCamera") : i18n.t("showAbstractView")}
    >
      {#if showAbstractView}
        <svg
          class="w-5 h-5 text-white group-hover:text-back-400 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      {:else}
        <svg
          class="w-5 h-5 text-white group-hover:text-back-400 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2C6.48 2 2 12 2 12s4.48 10 10 10 10-10 10-10-4.48-10-10-10z" />
        </svg>
      {/if}
    </button>
  {/if}
</div>
