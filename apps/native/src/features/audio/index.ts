import { DurusAudioService } from "@sd/domain-audio";
import { ExpoAudioAdapter } from "./engine/expo-audio.adapter";

// Expose the global singleton to be imported directly by any component in the native app
export const audioService = new DurusAudioService(new ExpoAudioAdapter());

// Export UI components
export { MiniPlayer } from "./components/mini-player";
