import { DownloadTask, Directory, File, Paths } from "expo-file-system";

import { enqueueDownloadMutation } from "@/features/downloads/outbox/outbox.drain";
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

function destinationFor(lectureId: string): File {
  const dir = new Directory(Paths.document, "lectures") as DirectoryWithFsOps;
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return new File(dir, `${lectureId}.mp3`);
}

/** Downloads a lecture's audio to local storage, tracking progress/status
 * through the downloads store (which writes through to the SQLite registry,
 * so it survives an app restart even though the native task itself does not). */
export async function downloadLecture(lectureId: string, audioUrl: string): Promise<void> {
  const { actions } = useDownloadsStore.getState();

  await actions.upsert({
    listingId: lectureId,
    url: audioUrl,
    status: "downloading",
    bytesTotal: 0,
    bytesDownloaded: 0,
  });

  const destination = destinationFor(lectureId);
  const task = new DownloadTask(audioUrl, destination, {
    onProgress: (progress) => {
      void actions.upsert({
        listingId: lectureId,
        bytesTotal: progress.totalBytes,
        bytesDownloaded: progress.bytesWritten,
        status: "downloading",
      });
    },
  });
  activeTasks.set(lectureId, task);

  try {
    const file = (await task.downloadAsync()) as FileWithFsOps | null;
    if (file) {
      await actions.upsert({ listingId: lectureId, status: "complete", localUri: file.uri });
    }
  } catch {
    await actions.upsert({ listingId: lectureId, status: "error" });
    // Queued for automatic retry on the next foreground/reconnect drain —
    // the user doesn't have to remember to manually tap Retry.
    enqueueDownloadMutation("start-download", { lectureId, audioUrl });
  } finally {
    activeTasks.delete(lectureId);
  }
}

/** Cancels an in-flight task (if any), deletes the local file (if any), and
 * removes the registry row. */
export async function removeLecture(lectureId: string): Promise<void> {
  activeTasks.get(lectureId)?.cancel();
  activeTasks.delete(lectureId);

  const row = await getDownload(lectureId);
  if (row?.localUri) {
    try {
      (new File(row.localUri) as FileWithFsOps).delete();
    } catch {
      // Best-effort — still remove the row below regardless.
    }
  }

  await useDownloadsStore.getState().actions.remove(lectureId);
}

/** Local file uri for a downloaded lecture, or undefined if not (fully)
 * downloaded. Used by `DurusAudioService` to prefer local files over streaming. */
export async function getLocalAudioUri(lectureId: string): Promise<string | undefined> {
  const row = await getDownload(lectureId);
  return row?.status === "complete" && row.localUri ? row.localUri : undefined;
}

/** Dispatches a queued downloads-outbox entry by type. Passed to
 * `drainDownloadsOutbox` from the app-foreground/network-reconnect triggers. */
export async function handleDownloadOutboxEntry(type: string, payload: unknown): Promise<void> {
  if (type === "start-download") {
    const { lectureId, audioUrl } = payload as { lectureId: string; audioUrl: string };
    await downloadLecture(lectureId, audioUrl);
  }
}
