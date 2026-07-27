import { DurusAudioService } from "@sd/domain-audio";

import { HTMLAudioAdapter } from "./engine/html-audio.adapter";

export const audioService = new DurusAudioService(new HTMLAudioAdapter());
