import { DurusAudioService, type Track } from "@sd/domain-audio";

import { getLocalAudioUri } from "@/features/downloads/engine/download.engine";

import { ExpoAudioAdapter } from "./engine/expo-audio.adapter";

/** Adapts the platform audio engine to the native playback contract and lifecycle. */
async function resolveLocalUri(track: Track): Promise<string | undefined> {
  return getLocalAudioUri(track.id);
}

// Global singleton for the native app
/** Creates the audio service with the Expo adapter and local-URI resolver used by native playback. */
export const audioService = new DurusAudioService(new ExpoAudioAdapter(), resolveLocalUri);
