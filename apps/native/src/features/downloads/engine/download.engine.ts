import { DownloadTask, Directory, File, Paths } from "expo-file-system";

import { enqueueDownloadMutation } from "@/features/downloads/outbox/outbox.drain";
import { type DownloadOutboxPayload } from "@/features/downloads/outbox/outbox.store";
import { getDownload } from "@/features/downloads/registry/downloads.registry";
import { useDownloadsStore } from "@/features/downloads/store/downloads.store";

/** Tracks in-flight tasks for this process only — not restored across app
 * restarts (expo-file-system doesn't restore JS task instances either). */
const activeTasks = new Map<string, DownloadTask>();

// expo-file-system@57's File/Directory extend a native-module base class whose
// `uri`/`exists`/`create`/`delete` members exist at runtime (per the package's
// own docs/source) but aren't visible through its shipped .d.ts inheritance —
// a real upstream typing gap, not something these types should ever lack.
type FileWithFsOps = File & { uri: string; delete(): void };
type DirectoryWithFsOps = Directory & {
  exists: boolean;
  create(options?: { intermediates?: boolean }): void;
};

function destinationFor(listingSlug: string): File {
  // SAFETY: expo-file-system's Directory instance exposes `exists` and
  // `create()` at runtime; this narrows a known library typing gap.
  const dir = new Directory(Paths.document, "lectures") as DirectoryWithFsOps;
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return new File(dir, `${listingSlug}.mp3`);
}

/** Downloads a lecture's audio to local storage, tracking progress/status
 * through the downloads store (which writes through to the SQLite registry,
 * so it survives an app restart even though the native task itself does not). */
export async function downloadLecture(listingSlug: string, audioUrl: string): Promise<void> {
  const { actions } = useDownloadsStore.getState();

  await actions.upsert({
    listingSlug,
    url: audioUrl,
    status: "downloading",
    bytesTotal: 0,
    bytesDownloaded: 0,
  });

  const destination = destinationFor(listingSlug);
  const task = new DownloadTask(audioUrl, destination, {
    onProgress: (progress) => {
      void actions.upsert({
        listingSlug,
        bytesTotal: progress.totalBytes,
        bytesDownloaded: progress.bytesWritten,
        status: "downloading",
      });
    },
  });
  activeTasks.set(listingSlug, task);

  try {
    // SAFETY: expo-file-system resolves downloads to File instances with a
    // concrete `uri`; the extra method/property are present at runtime.
    const file = (await task.downloadAsync()) as FileWithFsOps | null;
    if (file) {
      await actions.upsert({ listingSlug, status: "complete", localUri: file.uri });
    }
  } catch {
    await actions.upsert({ listingSlug, status: "error" });
    // Queued for automatic retry on the next foreground/reconnect drain —
    // the user doesn't have to remember to manually tap Retry.
    enqueueDownloadMutation("start-download", { listingSlug, audioUrl });
  } finally {
    activeTasks.delete(listingSlug);
  }
}

/** Cancels an in-flight task (if any), deletes the local file (if any), and
 * removes the registry row. */
export async function removeLecture(listingSlug: string): Promise<void> {
  activeTasks.get(listingSlug)?.cancel();
  activeTasks.delete(listingSlug);

  const row = await getDownload(listingSlug);
  if (row?.localUri) {
    try {
      // SAFETY: constructing File from a persisted local uri yields a runtime
      // File instance whose `delete()` method exists despite missing typings.
      (new File(row.localUri) as FileWithFsOps).delete();
    } catch {
      // Best-effort — still remove the row below regardless.
    }
  }

  await useDownloadsStore.getState().actions.remove(listingSlug);
}

/** Local file uri for a downloaded lecture, or undefined if not (fully)
 * downloaded. Used by `DurusAudioService` to prefer local files over streaming. */
export async function getLocalAudioUri(listingSlug: string): Promise<string | undefined> {
  const row = await getDownload(listingSlug);
  return row?.status === "complete" && row.localUri ? row.localUri : undefined;
}

/** Dispatches a queued downloads-outbox entry by type. Passed to
 * `drainDownloadsOutbox` from the app-foreground/network-reconnect triggers. */
export async function handleDownloadOutboxEntry(
  type: string,
  payload: DownloadOutboxPayload,
): Promise<void> {
  if (type === "start-download") {
    const { listingSlug, audioUrl } = payload;
    await downloadLecture(listingSlug, audioUrl);
  }
}
