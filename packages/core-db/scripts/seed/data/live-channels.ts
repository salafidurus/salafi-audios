export interface LiveChannelData {
  id: string;
  scholarIdx: number;
  telegramId: string;
  telegramSlug: string;
  displayName: string;
}

export const LIVE_CHANNELS: LiveChannelData[] = [
  {
    id: "e2e-live-channel-1",
    scholarIdx: 5, // e2e-scholar-slug which is at index 5 of SCHOLARS
    telegramId: "-10022334455",
    telegramSlug: "e2e_channel_slug",
    displayName: "E2E Live Channel",
  },
];
