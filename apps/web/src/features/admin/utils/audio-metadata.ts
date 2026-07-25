export async function extractAudioDuration(file: File): Promise<number> {
  let duration = 0;

  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.src = objectUrl;
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
        duration = audio.duration;
        resolve();
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
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return duration;
}
