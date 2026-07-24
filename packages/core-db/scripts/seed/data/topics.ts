/**
 * Topic seed data
 */

import { uuid } from "../helpers.js";

export interface TopicData {
  id: string;
  slug: string;
  name: string;
  orderIndex?: number;
}

export const TOPICS: TopicData[] = [
  { id: uuid(10), slug: "aqeedah", name: "Aqeedah", orderIndex: 1 },
  { id: uuid(11), slug: "nahw", name: "Nahw", orderIndex: 4 },
  { id: uuid(12), slug: "hadith", name: "Hadith", orderIndex: 2 },
  { id: uuid(13), slug: "fiqh", name: "Fiqh", orderIndex: 0 },
  { id: uuid(14), slug: "tafsir", name: "Tafsir", orderIndex: 3 },
  { id: uuid(15), slug: "e2e-parent-topic", name: "Parent Topic" },
  { id: uuid(16), slug: "e2e-child-topic", name: "Child Topic" },
];
