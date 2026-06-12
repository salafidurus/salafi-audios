import { DurusAudioService } from "@sd/domain-audio";
import { HTMLAudioAdapter } from "./engine/html-audio.adapter";

// Expose the global singleton to be imported directly by any component in the web app
export const audioService = new DurusAudioService(new HTMLAudioAdapter());

// Export UI components
export { MiniPlayer } from "./components/mini-player";
