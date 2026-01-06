// Posture state management using Svelte 5 runes

export const PostureStatus = {
  GOOD: "good",
  LEANING: "leaning",
  TOO_CLOSE: "too_close",
  SLOUCHING: "slouching",
  NOT_DETECTED: "not_detected",
} as const;

export type PostureStatusType =
  (typeof PostureStatus)[keyof typeof PostureStatus];

export interface PostureThresholds {
  minDistance: number;
  maxLeanAngle: number;
  maxSlouchAngle: number;
}

export interface SessionStats {
  totalTime: number;
  goodPostureTime: number;
  alerts: number;
  startTime: number | null;
}

export interface PostureStore {
  status: PostureStatusType;
  confidence: number;
  distance: number;
  leanAngle: number;
  shoulderAngle: number;
  isTracking: boolean;
  readonly isCalibrated: boolean;
  lastGoodPosture: number;
  badPostureDuration: number;
  readonly thresholds: PostureThresholds;
  readonly sessionStats: SessionStats;
  readonly slouchBaseline: number | null;
  updateStats(deltaSeconds: number, isGood: boolean): void;
  incrementAlerts(): void;
  startSession(): void;
  getPostureScore(): number;
  calibrateSlouchBaseline(baseline: number): void;
  resetCalibration(): void;
}

function createPostureStore(): PostureStore {
  let status = $state<PostureStatusType>(PostureStatus.NOT_DETECTED);
  let confidence = $state(0);
  let distance = $state(0);
  let leanAngle = $state(0);
  let shoulderAngle = $state(0);
  let isTracking = $state(false);
  let isCalibrated = $state(false);
  let lastGoodPosture = $state(Date.now());
  let badPostureDuration = $state(0);
  let slouchBaseline = $state<number | null>(null);

  // Research-based defaults:
  // - Distance: OSHA recommends 50-70cm (arm's length) from screen
  // - Lean: Shoulder asymmetry >8° causes muscle strain over time
  // - Slouch: Forward head posture >12° significantly increases cervical load
  let thresholds = $state<PostureThresholds>({
    minDistance: 50,
    maxLeanAngle: 8,
    maxSlouchAngle: 12,
  });

  let sessionStats = $state<SessionStats>({
    totalTime: 0,
    goodPostureTime: 0,
    alerts: 0,
    startTime: null,
  });

  return {
    get status() {
      return status;
    },
    set status(v: PostureStatusType) {
      status = v;
    },

    get confidence() {
      return confidence;
    },
    set confidence(v: number) {
      confidence = v;
    },

    get distance() {
      return distance;
    },
    set distance(v: number) {
      distance = v;
    },

    get leanAngle() {
      return leanAngle;
    },
    set leanAngle(v: number) {
      leanAngle = v;
    },

    get shoulderAngle() {
      return shoulderAngle;
    },
    set shoulderAngle(v: number) {
      shoulderAngle = v;
    },

    get isTracking() {
      return isTracking;
    },
    set isTracking(v: boolean) {
      isTracking = v;
    },

    get isCalibrated() {
      return isCalibrated;
    },
    set isCalibrated(v: boolean) {
      isCalibrated = v;
    },

    get lastGoodPosture() {
      return lastGoodPosture;
    },
    set lastGoodPosture(v: number) {
      lastGoodPosture = v;
    },

    get badPostureDuration() {
      return badPostureDuration;
    },
    set badPostureDuration(v: number) {
      badPostureDuration = v;
    },

    get thresholds() {
      return thresholds;
    },
    set thresholds(v: PostureThresholds) {
      thresholds = v;
    },

    get sessionStats() {
      return sessionStats;
    },
    set sessionStats(v: SessionStats) {
      sessionStats = v;
    },

    get slouchBaseline() {
      return slouchBaseline;
    },
    set slouchBaseline(v: number | null) {
      slouchBaseline = v;
    },

    updateStats(deltaSeconds: number, isGood: boolean) {
      sessionStats.totalTime += deltaSeconds;
      if (isGood) {
        sessionStats.goodPostureTime += deltaSeconds;
      }
    },

    incrementAlerts() {
      sessionStats.alerts += 1;
    },

    startSession() {
      sessionStats = {
        totalTime: 0,
        goodPostureTime: 0,
        alerts: 0,
        startTime: Date.now(),
      };
    },

    getPostureScore(): number {
      if (sessionStats.totalTime === 0) return 100;
      return Math.round(
        (sessionStats.goodPostureTime / sessionStats.totalTime) * 100
      );
    },

    calibrateSlouchBaseline(baseline: number) {
      slouchBaseline = baseline;
      isCalibrated = true;
    },

    resetCalibration() {
      slouchBaseline = null;
      isCalibrated = false;
    },
  };
}

export const postureStore = createPostureStore();
