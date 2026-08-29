import { SavedSyncDtoSchema, type SavedSyncDto as SavedSyncDtoType } from '@sd/core-contracts';

/** Defines the validated request contract for synchronizing saved listings. */
export { SavedSyncDtoSchema };
/** One client-side saved-listing change in the synchronization batch. */
export type SavedSyncDto = SavedSyncDtoType;
