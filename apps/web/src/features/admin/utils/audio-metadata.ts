/** Documents this module's responsibility and public boundary. */
function waitForAudioDuration(src: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const audio = new Audio();
    audio.src = src;
    let isSettled = false;

    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("error", onError);
    };

    const onLoadedMetadata = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);
      cleanup();
      resolve(audio.duration);
    };

    const onError = () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error("Failed to load audio metadata"));
    };

    const timeoutId = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(new Error("Audio metadata loading timeout"));
    }, 5000);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("error", onError);
  });
}

/** Documents the intent and contract of this declaration. */
export async function extractAudioDuration(file: File): Promise<number> {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await waitForAudioDuration(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Reads duration by pointing an <audio> element directly at a remote URL — the browser's own
 *  range requests pull just enough of the file to read metadata, no body download by our code. */
export async function extractAudioDurationFromUrl(url: string): Promise<number> {
  return waitForAudioDuration(url);
}
