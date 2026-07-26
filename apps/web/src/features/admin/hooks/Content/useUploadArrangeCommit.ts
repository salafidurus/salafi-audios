"use client";

import { useCallback } from "react";
import {
  ArrangeConflictError,
  commitArrange,
  getBatchPresignedUrls,
  updateListingMedia,
  uploadToR2WithProgress,
} from "@/features/admin/api/admin-lectures.api";
import { fetchFileFromUrl } from "@/features/admin/utils/fetch-remote-file";
import {
  buildCommitDto,
  buildPresignRequest,
  type UploadArrangeAction,
  type UploadArrangeState,
  type UploadItem,
} from "./useUploadArrangeState";

const UPLOAD_CONCURRENCY = 3;

/** Local files are already in memory; url-sourced items are only fetched here — at the
 *  moment the admin actually confirms the upload, not when the link was first added. */
async function resolveItemFile(
  item: UploadItem,
  dispatch: React.Dispatch<UploadArrangeAction>,
): Promise<File> {
  if (item.source.kind === "local") return item.source.file;

  const { id, sizeBytes } = item;
  return fetchFileFromUrl(item.source.url, (loaded, total) => {
    dispatch({
      type: "UPLOAD_PROGRESS",
      itemId: id,
      status: "downloading",
      percent: total ? Math.round((loaded / total) * 100) : 0,
      loadedBytes: loaded,
      totalBytes: total ?? sizeBytes,
    });
  });
}

async function uploadWithConcurrency(
  items: UploadItem[],
  dispatch: React.Dispatch<UploadArrangeAction>,
): Promise<boolean> {
  const queue = [...items];
  let allOk = true;

  const worker = async (): Promise<void> => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      const { id, sizeBytes, contentType } = item;
      const uploadUrl = item.upload.uploadUrl;
      if (!uploadUrl) {
        allOk = false;
        dispatch({ type: "UPLOAD_ERROR", itemId: id, error: "Missing upload URL" });
        continue;
      }
      try {
        const file = await resolveItemFile(item, dispatch);
        await uploadToR2WithProgress(uploadUrl, file, contentType, (percent) =>
          dispatch({
            type: "UPLOAD_PROGRESS",
            itemId: id,
            status: "uploading",
            percent,
            loadedBytes: Math.round((sizeBytes * percent) / 100),
            totalBytes: sizeBytes,
          }),
        );
        dispatch({ type: "UPLOAD_DONE", itemId: id });
      } catch (err) {
        allOk = false;
        dispatch({
          type: "UPLOAD_ERROR",
          itemId: id,
          error: (err as Error)?.message ?? "Upload failed",
        });
      }
    }
  };

  await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
  return allOk;
}

/**
 * The Upload-button flow: batch presign → parallel R2 PUTs with progress →
 * one transactional commit. Retries reuse already-uploaded objectKeys.
 */
export function useUploadArrangeCommit(
  state: UploadArrangeState,
  dispatch: React.Dispatch<UploadArrangeAction>,
  onSuccess: () => void | Promise<void>,
) {
  return useCallback(async () => {
    const { existing } = state;
    if (!existing || state.items.length === 0) return;

    try {
      // 1. Presign any item that doesn't already hold an objectKey (retry-safe).
      const needsPresign = state.items.filter((item) => item.upload.status !== "done");
      let itemsToUpload = needsPresign;
      if (needsPresign.length > 0) {
        dispatch({ type: "SET_PHASE", phase: "presigning" });
        const request = buildPresignRequest(state);
        const presign = await getBatchPresignedUrls({
          ...request,
          files: request.files.filter((f) => needsPresign.some((item) => item.id === f.clientId)),
        });
        dispatch({ type: "PRESIGNED", urls: presign.files });
        const urlById = new Map(presign.files.map((f) => [f.clientId, f]));
        itemsToUpload = needsPresign.map((item) => {
          const presigned = urlById.get(item.id);
          return presigned
            ? {
                ...item,
                upload: {
                  ...item.upload,
                  uploadUrl: presigned.uploadUrl,
                  objectKey: presigned.objectKey,
                },
              }
            : item;
        });
      }

      // 2. Upload in parallel with per-item progress.
      if (itemsToUpload.length > 0) {
        dispatch({ type: "SET_PHASE", phase: "uploading" });
        const ok = await uploadWithConcurrency(itemsToUpload, dispatch);
        if (!ok) {
          dispatch({
            type: "SET_ERROR",
            error: "Some files failed to upload. Fix the errors and try again.",
          });
          return;
        }
      }

      // 3. Commit — one transactional call (or the media endpoint for singles).
      dispatch({ type: "SET_PHASE", phase: "committing" });
      const stateWithKeys: UploadArrangeState = {
        ...state,
        items: state.items.map((item) => {
          const uploaded = itemsToUpload.find((u) => u.id === item.id);
          return uploaded ?? item;
        }),
      };

      if (existing.format === "single") {
        const item = stateWithKeys.items[0];
        if (!item?.upload.objectKey) throw new Error("Upload did not produce a storage key");
        await updateListingMedia(existing.id, {
          audioKey: item.upload.objectKey,
          durationSeconds: Math.round(item.durationSeconds ?? 0),
          sizeBytes: item.sizeBytes,
        });
      } else {
        await commitArrange(existing.id, buildCommitDto(stateWithKeys));
      }

      dispatch({ type: "SET_PHASE", phase: "done" });
      await onSuccess();
    } catch (err) {
      if (err instanceof ArrangeConflictError) {
        dispatch({ type: "COMMIT_CONFLICT", conflictSlugs: err.conflictingSlugs });
        return;
      }
      dispatch({
        type: "SET_ERROR",
        error: (err as Error)?.message ?? "Failed to save the arrangement.",
      });
    }
  }, [state, dispatch, onSuccess]);
}
