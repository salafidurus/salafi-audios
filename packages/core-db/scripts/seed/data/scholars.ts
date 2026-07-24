/**
 * Scholar seed data
 */

import { uuid } from "../helpers.js";

export interface ScholarData {
  id: string;
  slug: string;
  name: string;
  bio: string;
  country: string;
  mainLanguage: "en" | "ar";
  title?: "allamah" | "sheikh" | "ustadh" | "akh";
  orderIndex?: number;
}

export const SCHOLARS: ScholarData[] = [
  {
    id: uuid(1),
    slug: "uthaymin",
    name: "Muhammad ibn Salih al-Uthaymin",
    bio: "Foremost scholar of Ahl al-Sunnah in the 20th century. Expert in fiqh, aqeedah, and tafsir.",
    country: "SA",
    mainLanguage: "ar",
    title: "allamah",
    orderIndex: 1,
  },
  {
    id: uuid(2),
    slug: "fawzan",
    name: "Salih ibn Fawzan al-Fawzan",
    bio: "The Grand Mufti of the Kingdom of Saudi Arabia. Expert in various field of Islamic knowledge: Aqeedah, Fiqh, Tafsir, etc.",
    country: "SA",
    mainLanguage: "ar",
    title: "allamah",
    orderIndex: 0,
  },
  {
    id: uuid(3),
    slug: "arafat",
    name: "Arafat bn Hasan Al-Muhammadi",
    bio: "Contemporary Salafi scholar based in Saudi Arabia. Known for aqeedah and fiqh series.",
    country: "YE",
    mainLanguage: "ar",
    title: "sheikh",
    orderIndex: 0,
  },
  {
    id: uuid(4),
    slug: "mustafa-bn-mabram",
    name: "Mustafa bn Mabram",
    bio: "Specialist in Arabic grammar (nahw and sarf). Author of textbooks on i'rab.",
    country: "YE",
    mainLanguage: "ar",
    title: "ustadh",
    orderIndex: 0,
  },
  {
    id: uuid(5),
    slug: "abdullah-al-bukhari",
    name: "Abdullah al-Bukhari",
    bio: "Contemporary muhaddith specializing in hadith sciences and mustalah al-hadith.",
    country: "SA",
    mainLanguage: "ar",
    title: "akh",
    orderIndex: 0,
  },
  {
    id: uuid(6),
    slug: "e2e-scholar-slug",
    name: "Scholar Name (English)",
    bio: "English biography",
    country: "SA",
    mainLanguage: "ar",
  },
];
