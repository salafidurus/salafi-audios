/**
 * Topic seed data
 */

import { uuid } from "../helpers.js";

export interface TopicData {
  id: string;
  slug: string;
  /** Main-language (Arabic) name. */
  name: string;
  /** English translation, mirrored into a TopicTranslation on seed. */
  nameEn: string;
  orderIndex?: number;
}

export const TOPICS: TopicData[] = [
  { id: uuid(10), slug: "aqeedah", name: "العقيدة", nameEn: "Aqeedah", orderIndex: 0 },
  { id: uuid(11), slug: "nahw", name: "النحو", nameEn: "Nahw", orderIndex: 4 },
  { id: uuid(12), slug: "hadith", name: "الحديث", nameEn: "Hadith", orderIndex: 2 },
  { id: uuid(13), slug: "fiqh", name: "الفقه", nameEn: "Fiqh", orderIndex: 3 },
  { id: uuid(14), slug: "tafsir", name: "التفسير", nameEn: "Tafsir", orderIndex: 1 },
];
