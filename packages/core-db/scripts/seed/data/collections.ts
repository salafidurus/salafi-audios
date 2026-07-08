/**
 * Collection seed data
 * Collections contain modules (sub-series), each module contains lessons
 */

import type { CollectionSeed } from "../types.js";

/**
 * Collections: UUID indices 300-309
 * Modules: UUID indices 400-466
 * Module Lessons: UUID indices 500-638
 */
export const COLLECTIONS: CollectionSeed[] = [
  // ── Uthaymin ──
  {
    id: 300,
    scholarIdx: 0,
    slug: "uthaymin-sharh-al-mumti",
    title: "Sharh al-Mumti' li-Zad al-Mustaqni'",
    desc: "Encyclopedic commentary on al-Hajjawi's Zad al-Mustaqni' in Hanbali fiqh",
    topicIdx: 3,
    lessonDurationMin: 50,
    modules: [
      { id: 400, title: "Kitab al-Taharah", desc: "Purification", lessonCount: 2 },
      { id: 401, title: "Kitab al-Salah", desc: "Prayer", lessonCount: 2 },
      { id: 402, title: "Kitab al-Zakah", desc: "Zakat", lessonCount: 2 },
      { id: 403, title: "Kitab al-Sawm", desc: "Fasting", lessonCount: 2 },
      { id: 404, title: "Kitab al-Hajj", desc: "Pilgrimage", lessonCount: 2 },
      { id: 405, title: "Kitab al-Nikah", desc: "Marriage", lessonCount: 2 },
      { id: 406, title: "Kitab al-Talaq", desc: "Divorce", lessonCount: 2 },
      { id: 407, title: "Kitab al-Buyu'", desc: "Sales and Transactions", lessonCount: 2 },
      { id: 408, title: "Kitab al-Jana'iz", desc: "Funerals", lessonCount: 2 },
      { id: 409, title: "Kitab al-Ayman wa al-Nudhur", desc: "Oaths and Vows", lessonCount: 2 },
    ],
  },
  {
    id: 301,
    scholarIdx: 0,
    slug: "uthaymin-sharh-alfiyyah-ibn-malik",
    title: "Sharh Alfiyyah Ibn Malik",
    desc: "Commentary on the Alfiyyah poem by Ibn Malik covering Arabic grammar",
    topicIdx: 1,
    lessonDurationMin: 45,
    modules: [
      { id: 410, title: "al-Kalam wa al-Kalim", desc: "Speech and Word", lessonCount: 2 },
      { id: 411, title: "al-Fi'l", desc: "The Verb", lessonCount: 2 },
      { id: 412, title: "al-Ism", desc: "The Noun", lessonCount: 2 },
      { id: 413, title: "al-Harf", desc: "The Particle", lessonCount: 2 },
      { id: 414, title: "al-I'rab wa al-Bina'", desc: "Declension and Building", lessonCount: 2 },
    ],
  },

  // ── Fawzan ──
  {
    id: 302,
    scholarIdx: 1,
    slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah",
    title: "Sharh al-'Aqeedah al-Tahawiyyah",
    desc: "Commentary on the classical Tahawiyyah creed",
    topicIdx: 0,
    lessonDurationMin: 50,
    modules: [
      { id: 415, title: "Muqaddimah", desc: "Introduction", lessonCount: 2 },
      { id: 416, title: "al-Tawhid", desc: "Oneness of Allah", lessonCount: 2 },
      { id: 417, title: "al-Qada' wa al-Qadr", desc: "Predestination", lessonCount: 2 },
      { id: 418, title: "al-Qur'an", desc: "The Qur'an", lessonCount: 2 },
      { id: 419, title: "al-Ru'yat", desc: "Seeing Allah", lessonCount: 2 },
      { id: 420, title: "al-Nubuwwat", desc: "Prophethood", lessonCount: 2 },
      { id: 421, title: "al-Mala'ikah", desc: "Angels", lessonCount: 2 },
      { id: 422, title: "al-Sahabah", desc: "Companions", lessonCount: 2 },
      { id: 423, title: "al-Shafa'ah", desc: "Intercession", lessonCount: 2 },
      {
        id: 424,
        title: "al-Akhir wa al-Jannah wa al-Nar",
        desc: "Hereafter, Paradise, and Hellfire",
        lessonCount: 2,
      },
    ],
  },
  {
    id: 303,
    scholarIdx: 1,
    slug: "fawzan-al-muntaqa-min-fatawa",
    title: "al-Muntaqa min Fatawa al-Fawzan",
    desc: "Selected fatwas by Shaykh Salih al-Fawzan covering various topics",
    topicIdx: 3,
    lessonDurationMin: 45,
    modules: [
      { id: 425, title: "Fatawa al-Aqeedah", desc: "Creed-related verdicts", lessonCount: 2 },
      { id: 426, title: "Fatawa al-Salah", desc: "Prayer rulings", lessonCount: 2 },
      { id: 427, title: "Fatawa al-Zakah wa al-Sawm", desc: "Zakat and fasting", lessonCount: 2 },
      {
        id: 428,
        title: "Fatawa al-Nikah wa al-Talaq",
        desc: "Marriage and divorce",
        lessonCount: 2,
      },
      { id: 429, title: "Fatawa al-Mu'amalat", desc: "Transactions", lessonCount: 2 },
    ],
  },

  // ── Arafat ──
  {
    id: 304,
    scholarIdx: 2,
    slug: "arafat-sharh-abwab-mukhtarah",
    title: "Sharh Abwab Mukhtarah min Sahih al-Bukhari",
    desc: "Selected chapters from Sahih al-Bukhari on key topics",
    topicIdx: 2,
    lessonDurationMin: 45,
    modules: [
      { id: 430, title: "Kitab al-Fitan", desc: "Trials and tribulations", lessonCount: 3 },
      { id: 431, title: "Kitab al-Tawhid", desc: "Oneness of Allah", lessonCount: 3 },
      { id: 432, title: "Fadha'il al-Sahabah", desc: "Virtues of the Companions", lessonCount: 2 },
    ],
  },
  {
    id: 305,
    scholarIdx: 2,
    slug: "arafat-majmu-al-fatawa",
    title: "Majmu' Fatawa al-Shaykh Ahmad Arafat",
    desc: "Compilation of fatwas and selected treatises",
    topicIdx: 0,
    lessonDurationMin: 45,
    modules: [
      { id: 433, title: "al-Manhaj", desc: "Methodology", lessonCount: 2 },
      { id: 434, title: "al-Aqeedah", desc: "Creed", lessonCount: 3 },
      { id: 435, title: "al-Ibadat", desc: "Worship", lessonCount: 3 },
      { id: 436, title: "al-Bay'", desc: "Transactions", lessonCount: 2 },
    ],
  },

  // ── Mustafa ──
  {
    id: 306,
    scholarIdx: 3,
    slug: "mustafa-al-mukhtar-min-al-nahw",
    title: "al-Mukhtar min al-Nahw",
    desc: "Selected topics in Arabic grammar — a structured study of nahw",
    topicIdx: 1,
    lessonDurationMin: 40,
    modules: [
      { id: 437, title: "Muqaddimah", desc: "Introduction to nahw", lessonCount: 2 },
      { id: 438, title: "al-Jumlah al-Ismiyyah", desc: "Nominal sentence", lessonCount: 2 },
      { id: 439, title: "al-Jumlah al-Fi'liyyah", desc: "Verbal sentence", lessonCount: 2 },
      { id: 440, title: "al-Maf'ulat", desc: "Objects", lessonCount: 2 },
      { id: 441, title: "al-Majrurat", desc: "Genitive constructions", lessonCount: 2 },
      { id: 442, title: "al-Tawabi'", desc: "Apposition", lessonCount: 2 },
      { id: 443, title: "al-Mustathniyat", desc: "Exceptions", lessonCount: 2 },
      { id: 444, title: "al-Munadat", desc: "Vocative", lessonCount: 2 },
      {
        id: 445,
        title: "al-Tamyiz wa al-Hal",
        desc: "Distinction and circumstance",
        lessonCount: 2,
      },
      {
        id: 446,
        title: "al-Asalib al-Nahwiyyah",
        desc: "Grammatical constructions",
        lessonCount: 2,
      },
    ],
  },
  {
    id: 307,
    scholarIdx: 3,
    slug: "mustafa-sharh-fath-al-majid",
    title: "Sharh Fath al-Majid li-Kitab al-Tawhid",
    desc: "Commentary on 'Abd al-Rahman ibn Hasan's Fath al-Majid — exposition of Kitab al-Tawhid",
    topicIdx: 0,
    lessonDurationMin: 50,
    modules: [
      { id: 447, title: "Kitab al-Tawhid", desc: "Book of Tawheed", lessonCount: 2 },
      { id: 448, title: "Bab al-Shirk", desc: "Chapter of Shirk", lessonCount: 2 },
      { id: 449, title: "Bab al-Kibr wa al-Riya'", desc: "Pride and showing off", lessonCount: 2 },
      { id: 450, title: "Bab al-Sihr wa al-Tatayyur", desc: "Sorcery and omens", lessonCount: 2 },
      { id: 451, title: "Bab al-'Izzah", desc: "Chapter of honor", lessonCount: 2 },
    ],
  },

  // ── Bukhari ──
  {
    id: 308,
    scholarIdx: 4,
    slug: "bukhari-majmu-al-hadith",
    title: "Majmu' al-Hadith",
    desc: "A comprehensive collection of hadith with explanatory commentary and analysis of chains",
    topicIdx: 2,
    lessonDurationMin: 50,
    modules: [
      { id: 452, title: "Kitab al-Wahyi", desc: "Revelation", lessonCount: 2 },
      { id: 453, title: "Kitab al-Iman", desc: "Faith", lessonCount: 2 },
      { id: 454, title: "Kitab al-'Ilm", desc: "Knowledge", lessonCount: 2 },
      { id: 455, title: "Kitab al-Taharah", desc: "Purification", lessonCount: 2 },
      { id: 456, title: "Kitab al-Salah", desc: "Prayer", lessonCount: 2 },
      { id: 457, title: "Kitab al-Zakah", desc: "Zakat", lessonCount: 2 },
      { id: 458, title: "Kitab al-Sawm", desc: "Fasting", lessonCount: 2 },
      { id: 459, title: "Kitab al-Hajj", desc: "Pilgrimage", lessonCount: 2 },
      { id: 460, title: "Kitab al-Jihad", desc: "Striving", lessonCount: 2 },
      { id: 461, title: "Kitab al-Adab", desc: "Etiquette", lessonCount: 2 },
    ],
  },
  {
    id: 309,
    scholarIdx: 4,
    slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith",
    title: "al-Mukhtasar fi Mustalah al-Hadith",
    desc: "A concise study of hadith terminology — classification and methodology",
    topicIdx: 2,
    lessonDurationMin: 45,
    modules: [
      { id: 462, title: "al-Hadith al-Sahih", desc: "Authentic hadith", lessonCount: 3 },
      { id: 463, title: "al-Hadith al-Hasan", desc: "Good hadith", lessonCount: 2 },
      { id: 464, title: "al-Hadith al-Da'if", desc: "Weak hadith", lessonCount: 2 },
      { id: 465, title: "al-Jarh wa al-Ta'dil", desc: "Impugning and accrediting", lessonCount: 2 },
      {
        id: 466,
        title: "Tabaqat al-Muhaddithin",
        desc: "Generations of hadith scholars",
        lessonCount: 2,
      },
    ],
  },
];
