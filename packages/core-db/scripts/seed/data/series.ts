/**
 * Series seed data
 * Series are parent listings with multiple lessons
 */

import type { SeriesSeed } from "../types.js";

/**
 * Series parents: UUID indices 200-209
 * Series lessons: UUID indices 210-281
 */
export const SERIES: SeriesSeed[] = [
  {
    id: 200,
    scholarIdx: 0,
    slug: "uthaymin-aqeedah-al-wasitiyyah",
    title: "Sharh al-'Aqeedah al-Wasitiyyah",
    desc: "Commentary on Ibn Taymiyyah's al-'Aqeedah al-Wasitiyyah on orthodox creed",
    topicIdx: 0,
    lessonDurationMin: 50,
    lessons: [
      {
        id: 210,
        slug: "uthaymin-wasitiyyah-1",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-1.mp3",
      },
      {
        id: 211,
        slug: "uthaymin-wasitiyyah-2",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-2.mp3",
      },
      {
        id: 212,
        slug: "uthaymin-wasitiyyah-3",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-3.mp3",
      },
      {
        id: 213,
        slug: "uthaymin-wasitiyyah-4",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-4.mp3",
      },
      {
        id: 214,
        slug: "uthaymin-wasitiyyah-5",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-5.mp3",
      },
      {
        id: 215,
        slug: "uthaymin-wasitiyyah-6",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-6.mp3",
      },
      {
        id: 216,
        slug: "uthaymin-wasitiyyah-7",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-7.mp3",
      },
      {
        id: 217,
        slug: "uthaymin-wasitiyyah-8",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-8.mp3",
      },
      {
        id: 218,
        slug: "uthaymin-wasitiyyah-9",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-9.mp3",
      },
      {
        id: 219,
        slug: "uthaymin-wasitiyyah-10",
        audioUrl: "https://placeholder.dev/audio/uthaymin-wasitiyyah-10.mp3",
      },
    ],
  },
  {
    id: 201,
    scholarIdx: 0,
    slug: "uthaymin-rawd-al-murbi",
    title: "Sharh Rawd al-Murbi'",
    desc: "Commentary on Rawd al-Murbi' fi Fiqh al-Hanabilah — Hanbali fiqh",
    topicIdx: 3,
    lessonDurationMin: 45,
    lessons: [
      {
        id: 220,
        slug: "uthaymin-rawd-1",
        audioUrl: "https://placeholder.dev/audio/uthaymin-rawd-1.mp3",
      },
      {
        id: 221,
        slug: "uthaymin-rawd-2",
        audioUrl: "https://placeholder.dev/audio/uthaymin-rawd-2.mp3",
      },
      {
        id: 222,
        slug: "uthaymin-rawd-3",
        audioUrl: "https://placeholder.dev/audio/uthaymin-rawd-3.mp3",
      },
      {
        id: 223,
        slug: "uthaymin-rawd-4",
        audioUrl: "https://placeholder.dev/audio/uthaymin-rawd-4.mp3",
      },
      {
        id: 224,
        slug: "uthaymin-rawd-5",
        audioUrl: "https://placeholder.dev/audio/uthaymin-rawd-5.mp3",
      },
    ],
  },
  {
    id: 202,
    scholarIdx: 1,
    slug: "fawzan-kashf-al-shubuhat",
    title: "Sharh Kashf al-Shubuhat",
    desc: "Uncovering the doubts — refuting misconceptions about Tawheed",
    topicIdx: 0,
    lessonDurationMin: 50,
    lessons: [
      {
        id: 225,
        slug: "fawzan-kashf-1",
        audioUrl: "https://placeholder.dev/audio/fawzan-kashf-1.mp3",
      },
      {
        id: 226,
        slug: "fawzan-kashf-2",
        audioUrl: "https://placeholder.dev/audio/fawzan-kashf-2.mp3",
      },
    ],
  },
  {
    id: 203,
    scholarIdx: 1,
    slug: "fawzan-umdat-al-fiqh",
    title: "Sharh 'Umdat al-Fiqh",
    desc: "Commentary on 'Umdat al-Fiqh in Hanbali jurisprudence",
    topicIdx: 3,
    lessonDurationMin: 45,
    lessons: [
      {
        id: 227,
        slug: "fawzan-umdat-1",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-1.mp3",
      },
      {
        id: 228,
        slug: "fawzan-umdat-2",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-2.mp3",
      },
      {
        id: 229,
        slug: "fawzan-umdat-3",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-3.mp3",
      },
      {
        id: 230,
        slug: "fawzan-umdat-4",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-4.mp3",
      },
      {
        id: 231,
        slug: "fawzan-umdat-5",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-5.mp3",
      },
      {
        id: 232,
        slug: "fawzan-umdat-6",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-6.mp3",
      },
      {
        id: 233,
        slug: "fawzan-umdat-7",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-7.mp3",
      },
      {
        id: 234,
        slug: "fawzan-umdat-8",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-8.mp3",
      },
      {
        id: 235,
        slug: "fawzan-umdat-9",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-9.mp3",
      },
      {
        id: 236,
        slug: "fawzan-umdat-10",
        audioUrl: "https://placeholder.dev/audio/fawzan-umdat-10.mp3",
      },
    ],
  },
  {
    id: 204,
    scholarIdx: 2,
    slug: "arafat-masail-al-jahiliyyah",
    title: "Sharh Masail al-Jahiliyyah",
    desc: "Commentary on the issues of Jahiliyyah from the works of Muhammad ibn 'Abd al-Wahhab",
    topicIdx: 0,
    lessonDurationMin: 50,
    lessons: [
      {
        id: 237,
        slug: "arafat-masail-1",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-1.mp3",
      },
      {
        id: 238,
        slug: "arafat-masail-2",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-2.mp3",
      },
      {
        id: 239,
        slug: "arafat-masail-3",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-3.mp3",
      },
      {
        id: 240,
        slug: "arafat-masail-4",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-4.mp3",
      },
      {
        id: 241,
        slug: "arafat-masail-5",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-5.mp3",
      },
      {
        id: 242,
        slug: "arafat-masail-6",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-6.mp3",
      },
      {
        id: 243,
        slug: "arafat-masail-7",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-7.mp3",
      },
      {
        id: 244,
        slug: "arafat-masail-8",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-8.mp3",
      },
      {
        id: 245,
        slug: "arafat-masail-9",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-9.mp3",
      },
      {
        id: 246,
        slug: "arafat-masail-10",
        audioUrl: "https://placeholder.dev/audio/arafat-masail-10.mp3",
      },
    ],
  },
  {
    id: 205,
    scholarIdx: 2,
    slug: "arafat-risalah-ibn-abi-zayd",
    title: "Sharh Risalah Ibn Abi Zayd al-Qayrawani",
    desc: "Commentary on the classical Maliki fiqh treatise by Ibn Abi Zayd",
    topicIdx: 3,
    lessonDurationMin: 45,
    lessons: [
      {
        id: 247,
        slug: "arafat-risalah-1",
        audioUrl: "https://placeholder.dev/audio/arafat-risalah-1.mp3",
      },
      {
        id: 248,
        slug: "arafat-risalah-2",
        audioUrl: "https://placeholder.dev/audio/arafat-risalah-2.mp3",
      },
      {
        id: 249,
        slug: "arafat-risalah-3",
        audioUrl: "https://placeholder.dev/audio/arafat-risalah-3.mp3",
      },
      {
        id: 250,
        slug: "arafat-risalah-4",
        audioUrl: "https://placeholder.dev/audio/arafat-risalah-4.mp3",
      },
      {
        id: 251,
        slug: "arafat-risalah-5",
        audioUrl: "https://placeholder.dev/audio/arafat-risalah-5.mp3",
      },
    ],
  },
  {
    id: 206,
    scholarIdx: 3,
    slug: "mustafa-qawaid-al-irab",
    title: "Qawa'id al-I'rab",
    desc: "The grammatical rules of i'rab — a systematic study of Arabic syntax",
    topicIdx: 1,
    lessonDurationMin: 45,
    lessons: [
      {
        id: 252,
        slug: "mustafa-qawaid-1",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-1.mp3",
      },
      {
        id: 253,
        slug: "mustafa-qawaid-2",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-2.mp3",
      },
      {
        id: 254,
        slug: "mustafa-qawaid-3",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-3.mp3",
      },
      {
        id: 255,
        slug: "mustafa-qawaid-4",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-4.mp3",
      },
      {
        id: 256,
        slug: "mustafa-qawaid-5",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-5.mp3",
      },
      {
        id: 257,
        slug: "mustafa-qawaid-6",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-6.mp3",
      },
      {
        id: 258,
        slug: "mustafa-qawaid-7",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-7.mp3",
      },
      {
        id: 259,
        slug: "mustafa-qawaid-8",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-8.mp3",
      },
      {
        id: 260,
        slug: "mustafa-qawaid-9",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-9.mp3",
      },
      {
        id: 261,
        slug: "mustafa-qawaid-10",
        audioUrl: "https://placeholder.dev/audio/mustafa-qawaid-10.mp3",
      },
    ],
  },
  {
    id: 207,
    scholarIdx: 3,
    slug: "mustafa-sarf-al-muyassar",
    title: "Sarf al-Muyassar",
    desc: "Simplified study of Arabic morphology (sarf) and verb conjugation patterns",
    topicIdx: 1,
    lessonDurationMin: 40,
    lessons: [
      {
        id: 262,
        slug: "mustafa-sarf-1",
        audioUrl: "https://placeholder.dev/audio/mustafa-sarf-1.mp3",
      },
      {
        id: 263,
        slug: "mustafa-sarf-2",
        audioUrl: "https://placeholder.dev/audio/mustafa-sarf-2.mp3",
      },
      {
        id: 264,
        slug: "mustafa-sarf-3",
        audioUrl: "https://placeholder.dev/audio/mustafa-sarf-3.mp3",
      },
      {
        id: 265,
        slug: "mustafa-sarf-4",
        audioUrl: "https://placeholder.dev/audio/mustafa-sarf-4.mp3",
      },
      {
        id: 266,
        slug: "mustafa-sarf-5",
        audioUrl: "https://placeholder.dev/audio/mustafa-sarf-5.mp3",
      },
    ],
  },
  {
    id: 208,
    scholarIdx: 4,
    slug: "bukhari-dawabit-al-jarh-wa-al-tadil",
    title: "Dawabit al-Jarh wa al-Ta'dil",
    desc: "Principles and controls of jarh wa ta'dil — evaluating hadith narrators",
    topicIdx: 2,
    lessonDurationMin: 50,
    lessons: [
      {
        id: 267,
        slug: "bukhari-dawabit-1",
        audioUrl: "https://placeholder.dev/audio/bukhari-dawabit-1.mp3",
      },
      {
        id: 268,
        slug: "bukhari-dawabit-2",
        audioUrl: "https://placeholder.dev/audio/bukhari-dawabit-2.mp3",
      },
      {
        id: 269,
        slug: "bukhari-dawabit-3",
        audioUrl: "https://placeholder.dev/audio/bukhari-dawabit-3.mp3",
      },
      {
        id: 270,
        slug: "bukhari-dawabit-4",
        audioUrl: "https://placeholder.dev/audio/bukhari-dawabit-4.mp3",
      },
      {
        id: 271,
        slug: "bukhari-dawabit-5",
        audioUrl: "https://placeholder.dev/audio/bukhari-dawabit-5.mp3",
      },
    ],
  },
  {
    id: 209,
    scholarIdx: 4,
    slug: "bukhari-al-jami-fi-ulum-al-hadith",
    title: "al-Jami' fi 'Ulum al-Hadith",
    desc: "A comprehensive study of hadith sciences — classification and methodology",
    topicIdx: 2,
    lessonDurationMin: 50,
    lessons: [
      {
        id: 272,
        slug: "bukhari-jami-1",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-1.mp3",
      },
      {
        id: 273,
        slug: "bukhari-jami-2",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-2.mp3",
      },
      {
        id: 274,
        slug: "bukhari-jami-3",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-3.mp3",
      },
      {
        id: 275,
        slug: "bukhari-jami-4",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-4.mp3",
      },
      {
        id: 276,
        slug: "bukhari-jami-5",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-5.mp3",
      },
      {
        id: 277,
        slug: "bukhari-jami-6",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-6.mp3",
      },
      {
        id: 278,
        slug: "bukhari-jami-7",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-7.mp3",
      },
      {
        id: 279,
        slug: "bukhari-jami-8",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-8.mp3",
      },
      {
        id: 280,
        slug: "bukhari-jami-9",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-9.mp3",
      },
      {
        id: 281,
        slug: "bukhari-jami-10",
        audioUrl: "https://placeholder.dev/audio/bukhari-jami-10.mp3",
      },
    ],
  },
];
