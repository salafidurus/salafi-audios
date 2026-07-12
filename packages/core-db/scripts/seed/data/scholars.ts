/**
 * Scholar seed data
 */

import { uuid } from "../helpers.js";

export interface ScholarData {
  id: string;
  slug: string;
  name: string;
  bio: string;
  isKibar: boolean;
  country: string;
  mainLanguage: "en" | "ar";
}

export const SCHOLARS: ScholarData[] = [
  {
    id: uuid(1),
    slug: "uthaymin",
    name: "Muhammad ibn Salih al-Uthaymin",
    bio: "Foremost scholar of Ahl al-Sunnah in the 20th century. Expert in fiqh, aqeedah, and tafsir.",
    isKibar: true,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
  {
    id: uuid(2),
    slug: "fawzan",
    name: "Salih ibn Fawzan al-Fawzan",
    bio: "The Grand Mufti of the Kingdom of Saudi Arabia. Expert in various field of Islamic knowledge: Aqeedah, Fiqh, Tafsir, etc.",
    isKibar: true,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
  {
    id: uuid(3),
    slug: "arafat",
    name: "Arafat bn Hasan Al-Muhammadi",
    bio: "Contemporary Salafi scholar based in Saudi Arabia. Known for aqeedah and fiqh series.",
    isKibar: false,
    country: "Yemen",
    mainLanguage: "ar",
  },
  {
    id: uuid(4),
    slug: "mustafa-bn-mabram",
    name: "Mustafa bn Mabram",
    bio: "Specialist in Arabic grammar (nahw and sarf). Author of textbooks on i'rab.",
    isKibar: false,
    country: "Yemen",
    mainLanguage: "ar",
  },
  {
    id: uuid(5),
    slug: "abdullah-al-bukhari",
    name: "Abdullah al-Bukhari",
    bio: "Contemporary muhaddith specializing in hadith sciences and mustalah al-hadith.",
    isKibar: true,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
  {
    id: uuid(6),
    slug: "e2e-scholar-slug",
    name: "Scholar Name (English)",
    bio: "English biography",
    isKibar: false,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
];
