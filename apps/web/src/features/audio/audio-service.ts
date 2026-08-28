import { DurusAudioService } from "@sd/domain-audio";

import { HTMLAudioAdapter } from "./engine/html-audio.adapter";

/** Exposes the application audio boundary. */
/** Singleton audio service shared by route-level controls and the persistent mini-player. */
export const audioService = new DurusAudioService(new HTMLAudioAdapter());
