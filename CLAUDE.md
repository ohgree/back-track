# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BackTrack is an AI-powered posture monitoring web app that uses MediaPipe for real-time pose detection via the webcam. It detects bad posture (leaning, slouching, too close to screen) and sends notifications. All processing happens locally in the browser.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Build for production (outputs to build/)
pnpm preview      # Preview production build
pnpm check        # Run svelte-check for type checking
pnpm lint         # Run ESLint
pnpm lint:fix     # Run ESLint with auto-fix
pnpm format       # Format with Prettier
pnpm format:check # Check formatting
```

## Tech Stack

- **SvelteKit** with Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`)
- **Tailwind CSS 4** (CSS-based configuration in `app.css`, no `tailwind.config.js`)
- **MediaPipe Tasks Vision** for pose landmark detection
- **Static adapter** for deployment (SPA with `index.html` fallback)
- **pnpm** as package manager

## Architecture

### State Management

Uses Svelte 5 runes pattern for reactive state. Stores are in `src/lib/stores/`:

- `posture.svelte.ts` - Main posture state: status, thresholds, calibration, session stats. Creates a singleton store using `$state()` with getter/setter pattern.
- `notifications.svelte.ts` - Toast notification queue
- `i18n.svelte.ts` - Internationalization

### Pose Analysis Flow

1. `camera.svelte` initializes webcam and MediaPipe PoseLandmarker
2. On each frame, calls `analyzePose()` from `pose-analyzer.ts`
3. `pose-analyzer.ts` calculates:
   - **Distance**: estimated from shoulder width ratio
   - **Lean angle**: shoulder tilt left/right
   - **Slouch angle**: forward head posture using nose-to-shoulder ratio (combines y and z coordinates)
4. Calibration: After 3 seconds of good tracking (>70% confidence), captures baseline slouch ratio
5. Results update `postureStore`, triggering UI updates

### Background Detection

When tab is hidden, detection switches from `requestAnimationFrame` (30fps) to `setInterval` (1/sec). Uses Web Lock API to prevent tab suspension.

### Key Thresholds (defaults)

- Min distance: 50cm
- Max lean angle: 8°
- Max slouch angle: 12°

Bad posture for >5 seconds triggers notification with 10-second cooldown.

## Styling

Tailwind 4 with custom theme variables defined in `src/app.css`:
- `--color-back-*` - Primary green colors
- `--color-warn-*` - Warning orange colors
- `--font-display` / `--font-body` - Typography

Uses `glass` utility class for frosted glass card effect.
