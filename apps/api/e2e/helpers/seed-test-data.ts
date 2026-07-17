function uuid(index: number): string {
  return `a0000000-0000-0000-0000-${String(index).padStart(12, '0')}`;
}

export const TEST_SCHOLAR_ID = uuid(6); // index 6 scholar (e2e-scholar-slug)
export const TEST_SCHOLAR_SLUG = 'e2e-scholar-slug';
export const TEST_PARENT_TOPIC_ID = uuid(15); // index 15 parent topic (e2e-parent-topic)
export const TEST_CHILD_TOPIC_ID = uuid(16); // index 16 child topic (e2e-child-topic)
export const TEST_LISTING_ID = uuid(110); // index 110 single (e2e-listing-slug)
export const TEST_LISTING_SLUG = 'e2e-listing-slug';
export const TEST_LIVE_CHANNEL_ID = 'e2e-live-channel-1';
export const TEST_LIVE_CHANNEL_TELEGRAM_ID = '-10022334455';
