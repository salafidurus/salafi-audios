import { DurusAudioService } from "@sd/domain-audio";

import { HTMLAudioAdapter } from "./engine/html-audio.adapter";

/** Documents this module's responsibility and public boundary. */
export const audioService = new DurusAudioService(new HTMLAudioAdapter());
