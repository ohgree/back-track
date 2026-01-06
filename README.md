# BackTrack

AI-powered posture monitoring web app that uses your camera to detect bad posture and send notifications when you lean, get too close to the screen, or slouch.

[![GitHub](https://img.shields.io/badge/GitHub-ohgree-181717?logo=github)](https://github.com/ohgree/back-track)
![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00?logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-4285f4?logo=google)

## Features

- **📹 Real-time pose detection** — Uses MediaPipe to track 33 body landmarks at 30fps
- **🔔 Smart notifications** — Alerts when you:
  - Lean left or right
  - Get too close to your screen
  - Slouch forward
- **📊 Session statistics** — Tracks posture score, session time, and alert count
- **⚙️ Adjustable sensitivity** — Customize thresholds for distance, lean, and slouch detection
- **🔒 Privacy-first** — All processing happens locally in your browser. No data ever leaves your device.

## Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) with Svelte 5 runes
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with CSS-based configuration
- **Pose Detection:** [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- **Language:** TypeScript
- **Build Tool:** [Vite](https://vite.dev/) 7
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/ohgree/back-track.git
cd back-track

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Type Checking

```bash
# Run svelte-check
pnpm check
```

## Usage

1. **Allow camera access** when prompted by your browser
2. **Position yourself** so your upper body is visible in the frame
3. **Sit normally** — the app will detect your posture in real-time
4. **Get notified** after 5+ seconds of bad posture
5. **Enable browser notifications** in Settings to get alerts even when the tab is in the background

### Tips for Best Results

- Sit at arm's length from your screen (~50-70cm)
- Position your camera at eye level
- Ensure good lighting so the camera can see you clearly
- Keep your shoulders visible in the frame

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── camera.svelte         # Webcam + pose detection
│   │   ├── notification.svelte   # Toast notifications
│   │   ├── status-card.svelte    # Current posture status
│   │   ├── stats-card.svelte     # Session statistics
│   │   └── settings-card.svelte  # Sensitivity controls
│   ├── stores/
│   │   ├── posture.svelte.ts     # Posture state (Svelte 5 runes)
│   │   └── notifications.svelte.ts
│   └── utils/
│       └── pose-analyzer.ts      # MediaPipe landmark analysis
├── routes/
│   ├── +layout.svelte
│   └── +page.svelte              # Main app page
├── app.css                       # Global styles + Tailwind theme config
└── app.html
```

## How It Works

1. **Camera Feed** — Captures video from your webcam
2. **Pose Detection** — MediaPipe analyzes each frame to detect 33 body landmarks
3. **Posture Analysis** — Custom algorithm calculates:
   - **Distance** from screen (based on shoulder width)
   - **Lean angle** (shoulder tilt left/right)
   - **Slouch angle** (forward head posture)
4. **Notifications** — Triggers alerts when thresholds are exceeded for 5+ seconds

## Limitations

> **⚠️ Keep this tab visible for posture monitoring to work.**

Due to browser security and performance restrictions:

- **Pose detection requires an active tab** — Browsers throttle or pause `requestAnimationFrame` and video processing when tabs are in the background. This means posture monitoring only works while the BackTrack tab is visible.
- **Notifications work best in foreground** — While browser notifications are sent for posture alerts, the detection itself cannot run when you switch to another tab or application.

**Workaround:** Keep BackTrack open in a separate browser window positioned where you can see it, or use a secondary monitor.

## License

[MIT](LICENSE)
