# Stage 3: Native Audio Streaming on `expo-audio`

Deliver concrete streaming playback in the native application. This stage configures the background audio permissions, builds the concrete `ExpoAudioAdapter` implementing the `PlaybackEngine` contract, wires up the React Context Provider, and implements the mini-player and full-screen player UI screens under the unified `apps/native/src/features/audio/` feature folder.

## User Review Required

> [!IMPORTANT]
> **Native Background Audio Configurations (app.config.ts):**
> To support background playback and lock-screen controls, we must add mandatory background audio configurations to the Expo configuration:
> * iOS: Register `"audio"` in `ios.infoPlist.UIBackgroundModes`.
> * Android: Add permissions `FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK` to support background audio services in Android 14+ (API 34+).

## Proposed Changes

---

### Component: Native Shell Configurations (`apps/native`)

#### [MODIFY] [app.config.ts](file:///C:/dev/salafi-audios/apps/native/app.config.ts)
* Add background audio permissions and keys to Expo configuration:
  * Register `UIBackgroundModes: ["audio"]` under `ios.infoPlist`.
  * Add `"android.permission.FOREGROUND_SERVICE"` and `"android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"` under `android.permissions`.

#### [MODIFY] [package.json](file:///C:/dev/salafi-audios/apps/native/package.json)
* Add `expo-audio` to the dependencies map.

---

### Component: Native Audio Feature Module (`apps/native/src/features/audio`)

We will create a unified `features/audio` feature slice inside the native application to house all UI screens, custom seek bars, and native player adapters.

#### [NEW] [expo-audio.adapter.ts](file:///C:/dev/salafi-audios/apps/native/src/features/audio/engine/expo-audio.adapter.ts)
* Implement `PlaybackEngine` defined in `@sd/domain-audio` using Expo SDK 55's stable `expo-audio` player:
  * Wire up the native `AudioPlayer` instance.
  * Listen to native position, status, and termination events, and delegate them to the domain engine callbacks (`onPositionChange`, `onStatusChange`, `onTrackEnd`).

#### [NEW] [lock-screen.service.ts](file:///C:/dev/salafi-audios/apps/native/src/features/audio/engine/lock-screen.service.ts)
* Update system lock-screen metadata (artist, title, album, artwork, duration) as active tracks change using `expo-audio`'s native background player notification channels.

#### [NEW] [audio.provider.tsx](file:///C:/dev/salafi-audios/apps/native/src/features/audio/provider/audio.provider.tsx)
* Create React Context that instantiates `ExpoAudioAdapter` and passes `DurusAudioService` down the component tree.

#### [NEW] [use-audio.ts](file:///C:/dev/salafi-audios/apps/native/src/features/audio/hooks/use-audio.ts)
* Create custom hook wrapping React Context access to retrieve `DurusAudioService` and the reactive `useAudio()` hooks from `@sd/domain-audio`.

#### [NEW] [progress-bar.tsx](file:///C:/dev/salafi-audios/apps/native/src/features/audio/components/progress-bar.tsx)
* Build custom slider-based seek bar. Handles local slide gestures for seeking, and snaps back to track time ticks when seeking is completed.

#### [NEW] [playback-controls.tsx](file:///C:/dev/salafi-audios/apps/native/src/features/audio/components/playback-controls.tsx)
* Build reusable playback control buttons: play/pause, skip ±30s, and playback speed selector (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `1.75x`, `2.0x`).

#### [NEW] [mini-player.tsx](file:///C:/dev/salafi-audios/apps/native/src/features/audio/components/mini-player.tsx)
* Persistent player bar visible at the bottom of the viewport whenever a track is loaded. Displays play/pause state and taps route the user to the fullscreen player modal.

#### [NEW] [player-fullscreen.screen.tsx](file:///C:/dev/salafi-audios/apps/native/src/features/audio/screens/player-fullscreen.screen.tsx)
* Premium full-screen modal showing rich scholar details, lecture titles, large responsive artwork circles, custom seek bar slider, speed controls, and skipped controls.

#### [DELETE] [obsolete playback features folder](file:///C:/dev/salafi-audios/apps/native/src/features/playback)
* Delete legacy files under `apps/native/src/features/playback/*` to clean up old stubs.

---

### Component: Navigation & Layouts Wiring (`apps/native/src/app`)

#### [MODIFY] [RootLayout](file:///C:/dev/salafi-audios/apps/native/src/app/_layout.tsx)
* Wrap the slots structure in `AudioProvider`.
* Mount the `<MiniPlayer />` at the root stack level so it floats globally across all tabs and detailed search views.

---

## Verification Plan

### Automated Tests
* Create unit tests for `ExpoAudioAdapter` mocking native expo-audio hooks.
* Run API/Native typecheck suites to verify clean compilation.

### Manual Verification
* Run local android/iOS expo builds:
  ```bash
  pnpm dev:native
  ```
* Verify in Android Emulator or iOS Simulator:
  * Tapping play triggers audio playback.
  * Minimize app -> locks screen -> verifies background play audio continues, and lock-screen sliders/seek buttons function.
  * Modify speeds -> audio speeds up/slows down accordingly.
