/** Defines the platform-neutral progress indicator contract. */
/** A progress value and its platform presentation mode. */
export type NativeProgressProps = {
  value?: number;
  variant?: "circular" | "linear";
  testID?: string;
};
