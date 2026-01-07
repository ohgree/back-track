export type Locale = "en" | "ko";

export const translations = {
  en: {
    // App
    appTitle: "BackTrack",
    appSubtitle: "AI-powered posture monitoring to keep your back healthy while you work",
    pageTitle: "BackTrack — Posture Monitoring",

    // Quick Tips
    quickTips: "Quick Tips",
    tip1: "Sit at arm's length from your screen (~50-70cm)",
    tip2: "Keep your shoulders level and relaxed",
    tip3: "Position camera at eye level for best tracking",
    tip4: "Take a break every 30 minutes to stretch",

    // Privacy & Warning Cards
    privacyFirst: "Privacy First",
    privacyDesc:
      "All processing happens locally in your browser. No video data is ever sent to any server.",
    keepTabVisible: "Keep Tab Visible",
    keepTabDesc:
      "For best results, keep this tab visible. Background tracking continues at a reduced rate (once per second).",

    // Footer
    footerText: "Built with Svelte & MediaPipe • Your posture, your privacy",

    // Settings
    settings: "Settings",
    postureCalibration: "Posture Calibration",
    calibrated: "Calibrated ✓",
    calibrating: "Calibrating...",
    recalibrate: "Recalibrate",
    browserNotifications: "Browser Notifications",
    notificationDesc: "Get alerts even when tab is hidden",
    enabled: "✓ Enabled",
    blocked: "Blocked",
    enable: "Enable",
    test: "Test",
    sensitivity: "Sensitivity",
    minDistance: "Min Distance (cm)",
    closer: "Closer",
    further: "Further",
    maxLeanAngle: "Max Lean Angle (°)",
    maxSlouchAngle: "Max Slouch Angle (°)",
    strict: "Strict",
    relaxed: "Relaxed",
    distanceWarning:
      "OSHA recommends at least 50cm (arm's length) to reduce eye strain and maintain proper focus distance.",
    leanWarning:
      "Shoulder asymmetry above 10-12° can cause muscle imbalance and strain over prolonged periods.",
    slouchWarning:
      "Forward head posture above 15° significantly increases cervical spine load—each inch forward adds ~10 lbs of pressure.",

    // Stats
    sessionStats: "Session Stats",
    sessionTime: "Session Time",
    goodPosture: "Good Posture",
    alerts: "Alerts",

    // Status
    searching: "Searching...",
    perfectPosture: "Perfect Posture",
    tooClose: "Too Close",
    leaningLeft: "Leaning Left",
    leaningRight: "Leaning Right",
    slouching: "Slouching",
    confidence: "Confidence",
    distance: "Distance",
    lean: "Lean",
    slouch: "Slouch",

    // Camera
    initializingPose: "Initializing pose detection...",
    cameraAccessDenied: "Camera access denied. Please enable camera permissions.",
    poseDetectionFailed: "Failed to load pose detection model.",
    calibrationComplete: "Calibration complete! Your current posture is now the baseline.",
    testNotification: "Test notification - Browser notifications are working!",
    goodPostureStatus: "✓ Good Posture",
    leaningStatus: "⚠ Leaning",
    tooCloseStatus: "⚠ Too Close",
    slouchingStatus: "✗ Slouching",
    detectingStatus: "○ Detecting...",
    monitor: "MONITOR",
    holdStill: "Hold still — Calibrating...",
    positionYourself: "Position yourself in frame",
    cameraReady: "Camera ready",
    personDetected: "Person detected",
    waitingDetection: "Waiting for stable detection...",
    calibratingBaseline: "Calibrating posture baseline...",
    complete: "Complete!",
    calibrationTip: "💡 Sit with good posture — this will be your baseline",
    showCamera: "Show camera",
    showAbstractView: "Show abstract view",

    // Language
    language: "Language",
    english: "English",
    korean: "한국어",

    // Notification messages (from pose analyzer)
    tooCloseNotification: "Too close to screen",
    leaningLeftNotification: "Leaning left",
    leaningRightNotification: "Leaning right",
    slouchingNotification: "Slouching detected",

    // Background mode
    backgroundMode: "Background mode (limited)",
  },
  ko: {
    // App
    appTitle: "BackTrack",
    appSubtitle: "AI 기반 자세 모니터링으로 업무 중 건강한 허리를 유지하세요",
    pageTitle: "BackTrack — 자세 모니터링",

    // Quick Tips
    quickTips: "꿀팁",
    tip1: "화면에서 팔 길이만큼 떨어져 앉으세요 (~50-70cm)",
    tip2: "어깨를 수평으로 유지하고 힘을 빼세요",
    tip3: "최적의 추적을 위해 카메라를 눈높이에 맞추세요",
    tip4: "30분마다 스트레칭 휴식을 취하세요",

    // Privacy & Warning Cards
    privacyFirst: "개인정보 보호 우선",
    privacyDesc:
      "모든 처리는 브라우저에서 로컬로 이루어집니다. 영상 데이터는 서버로 전송되지 않습니다.",
    keepTabVisible: "탭을 활성 상태로 유지",
    keepTabDesc:
      "최상의 결과를 위해 이 탭을 활성 상태로 유지하세요. 백그라운드 추적은 초당 1회로 제한됩니다.",

    // Footer
    footerText: "Svelte & MediaPipe로 제작 • 당신의 자세, 당신의 프라이버시",

    // Settings
    settings: "설정",
    postureCalibration: "자세 보정",
    calibrated: "보정 완료 ✓",
    calibrating: "보정 중...",
    recalibrate: "재보정",
    browserNotifications: "브라우저 알림",
    notificationDesc: "탭이 숨겨져 있어도 알림을 받습니다",
    enabled: "✓ 활성화됨",
    blocked: "차단됨",
    enable: "활성화",
    test: "테스트",
    sensitivity: "민감도",
    minDistance: "최소 거리 (cm)",
    closer: "가까움",
    further: "멀리",
    maxLeanAngle: "최대 기울기 각도 (°)",
    maxSlouchAngle: "최대 구부림 각도 (°)",
    strict: "엄격",
    relaxed: "완화",
    distanceWarning:
      "OSHA는 눈의 피로를 줄이고 적절한 초점 거리를 유지하기 위해 최소 50cm(팔 길이)를 권장합니다.",
    leanWarning:
      "10-12° 이상의 어깨 비대칭은 장시간에 걸쳐 근육 불균형과 긴장을 유발할 수 있습니다.",
    slouchWarning:
      "15° 이상의 전방 두부 자세는 경추 부하를 크게 증가시킵니다—1인치 앞으로 숙일 때마다 약 4.5kg의 압력이 추가됩니다.",

    // Stats
    sessionStats: "세션 통계",
    sessionTime: "세션 시간",
    goodPosture: "좋은 자세",
    alerts: "알림 횟수",

    // Status
    searching: "탐색 중...",
    perfectPosture: "완벽한 자세",
    tooClose: "너무 가까움",
    leaningLeft: "왼쪽으로 기울어짐",
    leaningRight: "오른쪽으로 기울어짐",
    slouching: "구부정한 자세",
    confidence: "신뢰도",
    distance: "거리",
    lean: "기울기",
    slouch: "구부림",

    // Camera
    initializingPose: "자세 감지 초기화 중...",
    cameraAccessDenied: "카메라 접근이 거부되었습니다. 카메라 권한을 활성화해 주세요.",
    poseDetectionFailed: "자세 감지 모델을 불러오는 데 실패했습니다.",
    calibrationComplete: "보정 완료! 현재 자세가 기준선으로 설정되었습니다.",
    testNotification: "테스트 알림 - 브라우저 알림이 정상 작동합니다!",
    goodPostureStatus: "✓ 좋은 자세",
    leaningStatus: "⚠ 기울어짐",
    tooCloseStatus: "⚠ 너무 가까움",
    slouchingStatus: "✗ 구부정함",
    detectingStatus: "○ 감지 중...",
    monitor: "모니터",
    holdStill: "가만히 계세요 — 보정 중...",
    positionYourself: "프레임 안에 위치하세요",
    cameraReady: "카메라 준비됨",
    personDetected: "사람 감지됨",
    waitingDetection: "안정적인 감지 대기 중...",
    calibratingBaseline: "자세 기준선 보정 중...",
    complete: "완료!",
    calibrationTip: "💡 바른 자세로 앉으세요 — 이것이 기준선이 됩니다",
    showCamera: "카메라 보기",
    showAbstractView: "추상 뷰 보기",

    // Language
    language: "언어",
    english: "English",
    korean: "한국어",

    // Notification messages (from pose analyzer)
    tooCloseNotification: "화면에 너무 가깝습니다",
    leaningLeftNotification: "왼쪽으로 기울어져 있습니다",
    leaningRightNotification: "오른쪽으로 기울어져 있습니다",
    slouchingNotification: "구부정한 자세가 감지되었습니다",

    // Background mode
    backgroundMode: "백그라운드 모드 (제한됨)",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

class I18nStore {
  locale = $state<Locale>("en");

  constructor() {
    // Try to restore locale from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("backtrack-locale");
      if (saved === "en" || saved === "ko") {
        this.locale = saved;
      } else {
        // Auto-detect from browser
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("ko")) {
          this.locale = "ko";
        }
      }
    }
  }

  setLocale(locale: Locale) {
    this.locale = locale;
    if (typeof window !== "undefined") {
      localStorage.setItem("backtrack-locale", locale);
    }
  }

  t(key: TranslationKey): string {
    return translations[this.locale][key] || translations.en[key] || key;
  }
}

export const i18n = new I18nStore();
