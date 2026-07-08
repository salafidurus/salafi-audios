/**
 * Single (standalone lecture) seed data
 */

import type { SingleSeed } from "../types.js";

/**
 * Singles are standalone lectures - UUID indices 100-109
 */
export const SINGLES: SingleSeed[] = [
  {
    id: 100,
    scholarIdx: 0,
    slug: "uthaymin-al-qawaid-al-arba",
    title: "al-Qawa'id al-Arba'",
    desc: "Sharh al-Qawa'id al-Arba' — the Four Fundamental Principles of Tawheed",
    topicIdx: 0,
    durationMin: 50,
  },
  {
    id: 101,
    scholarIdx: 0,
    slug: "uthaymin-usul-al-tafsir",
    title: "Usul al-Tafsir",
    desc: "Usul al-Tafsir wa Qawa'iduhu — Fundamentals of Qur'anic interpretation",
    topicIdx: 4,
    durationMin: 55,
  },
  {
    id: 102,
    scholarIdx: 1,
    slug: "fawzan-nawaqid-al-islam",
    title: "Nawaqid al-Islam",
    desc: "The nullifiers of Islam — actions that remove one from the fold of Islam",
    topicIdx: 0,
    durationMin: 45,
  },
  {
    id: 103,
    scholarIdx: 1,
    slug: "fawzan-risalah-latifah-fi-usul-al-fiqh",
    title: "Risalah Latifah fi Usul al-Fiqh",
    desc: "A concise treatise on the fundamentals of fiqh jurisprudence",
    topicIdx: 3,
    durationMin: 40,
  },
  {
    id: 104,
    scholarIdx: 2,
    slug: "arafat-sharh-al-usul-al-thalathah",
    title: "Sharh al-Usul al-Thalathah",
    desc: "Explanation of the Three Fundamental Principles by Muhammad ibn 'Abd al-Wahhab",
    topicIdx: 0,
    durationMin: 60,
  },
  {
    id: 105,
    scholarIdx: 2,
    slug: "arafat-sharh-al-durus-al-muhimmah",
    title: "Sharh al-Durus al-Muhimmah",
    desc: "Important lessons for the Muslim community — essential Islamic knowledge",
    topicIdx: 0,
    durationMin: 50,
  },
  {
    id: 106,
    scholarIdx: 3,
    slug: "mustafa-tamrinat-al-irab",
    title: "Tamrinat al-I'rab",
    desc: "Practical exercises in Arabic i'rab (syntactic analysis)",
    topicIdx: 1,
    durationMin: 45,
  },
  {
    id: 107,
    scholarIdx: 3,
    slug: "mustafa-khulasat-al-irab",
    title: "Khulasat al-I'rab",
    desc: "Summary of i'rab with grammatical analysis exercises",
    topicIdx: 1,
    durationMin: 40,
  },
  {
    id: 108,
    scholarIdx: 4,
    slug: "bukhari-sharh-al-mandhumah-al-bayquniyyah",
    title: "Sharh al-Mandhumah al-Bayquniyyah",
    desc: "Commentary on the Bayquniyyah poem in mustalah al-hadith",
    topicIdx: 2,
    durationMin: 55,
  },
  {
    id: 109,
    scholarIdx: 4,
    slug: "bukhari-madkhal-ila-ilm-al-hadith",
    title: "Madkhal ila 'Ilm al-Hadith",
    desc: "An introduction to the science of hadith — terminology and classification",
    topicIdx: 2,
    durationMin: 50,
  },
];
