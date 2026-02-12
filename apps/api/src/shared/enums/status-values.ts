export const STATUS_VALUES = [
  'draft',
  'review',
  'published',
  'archived',
] as const;

export type StatusValue = (typeof STATUS_VALUES)[number];
