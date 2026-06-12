import { DurusAudioService } from "@sd/domain-audio";
import { ExpoAudioAdapter } from "./engine/expo-audio.adapter";

// Global singleton for the native app
export const audioService = new DurusAudioService(new ExpoAudioAdapter());
