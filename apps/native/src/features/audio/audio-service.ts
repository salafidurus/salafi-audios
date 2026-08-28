import { DurusAudioService, type Track } from "@sd/domain-audio";

import { getLocalAudioUri } from "@/features/downloads/engine/download.engine";

import { ExpoAudioAdapter } from "./engine/expo-audio.adapter";

/** Provides the native features audio audio-service module responsibility. */
async function resolveLocalUri(track: Track): Promise<string | undefined> {
  return getLocalAudioUri(track.id);
}

// Global singleton for the native app
/** Describes the const audioService = new DurusAudioService(new ExpoAudioAdapter(), resolveLocalUri); native declaration contract and behavior. */
export const audioService = new DurusAudioService(new ExpoAudioAdapter(), resolveLocalUri);
