import { ListeningSession } from "../session/listening.session";

/** Compatibility module exposing the legacy audio service name. */
/** @deprecated Use ListeningSession for the domain-level audio lifecycle. */
export class DurusAudioService extends ListeningSession {}
