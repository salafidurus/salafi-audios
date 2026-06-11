import type { Track } from "@sd/domain-audio";

export class LockScreenService {
  static updateMetadata(_track: Track) {
    // In expo-audio, system lock-screen metadata is managed natively by the OS
    // when the AudioPlayer plays background audio. If custom notification controls
    // are needed in a later phase, they can be wired cleanly here.
  }
}
