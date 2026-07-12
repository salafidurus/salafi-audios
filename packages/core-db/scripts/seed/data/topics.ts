/**
 * Topic seed data
 */

import { uuid } from "../helpers.js";

export interface TopicData {
  id: string;
  slug: string;
  name: string;
}

export const TOPICS: TopicData[] = [
  { id: uuid(10), slug: "aqeedah", name: "Aqeedah" },
  { id: uuid(11), slug: "nahw", name: "Nahw" },
  { id: uuid(12), slug: "hadith", name: "Hadith" },
  { id: uuid(13), slug: "fiqh", name: "Fiqh" },
  { id: uuid(14), slug: "tafsir", name: "Tafsir" },
];
