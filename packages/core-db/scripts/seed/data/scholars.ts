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
    bio: "Senior member of the Permanent Committee for Ifta. Expert in fiqh and aqeedah.",
    isKibar: true,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
  {
    id: uuid(3),
    slug: "arafat",
    name: "Ahmad ibn 'Umar Arafat",
    bio: "Contemporary Salafi scholar based in Egypt. Known for aqeedah and hadith series.",
    isKibar: false,
    country: "Egypt",
    mainLanguage: "ar",
  },
  {
    id: uuid(4),
    slug: "mustafa-bn-mabram",
    name: "Mustafa bn Mabram",
    bio: "Specialist in Arabic grammar (nahw and sarf). Author of textbooks on i'rab.",
    isKibar: false,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
  {
    id: uuid(5),
    slug: "abdullah-al-bukhari",
    name: "Abdullah al-Bukhari",
    bio: "Contemporary muhaddith specializing in hadith sciences and mustalah al-hadith.",
    isKibar: false,
    country: "Saudi Arabia",
    mainLanguage: "ar",
  },
];
