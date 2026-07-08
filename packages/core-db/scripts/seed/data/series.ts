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
    lessons: [210, 211, 212, 213, 214, 215, 216, 217, 218, 219].map((id) => ({
      id,
      slug: `uthaymin-wasitiyyah-${id - 209}`,
    })),
  },
  {
    id: 201,
    scholarIdx: 0,
    slug: "uthaymin-rawd-al-murbi",
    title: "Sharh Rawd al-Murbi'",
    desc: "Commentary on Rawd al-Murbi' fi Fiqh al-Hanabilah — Hanbali fiqh",
    topicIdx: 3,
    lessonDurationMin: 45,
    lessons: [220, 221, 222, 223, 224].map((id) => ({
      id,
      slug: `uthaymin-rawd-${id - 219}`,
    })),
  },
  {
    id: 202,
    scholarIdx: 1,
    slug: "fawzan-kashf-al-shubuhat",
    title: "Sharh Kashf al-Shubuhat",
    desc: "Uncovering the doubts — refuting misconceptions about Tawheed",
    topicIdx: 0,
    lessonDurationMin: 50,
    lessons: [225, 226].map((id) => ({ id, slug: `fawzan-kashf-${id - 224}` })),
  },
  {
    id: 203,
    scholarIdx: 1,
    slug: "fawzan-umdat-al-fiqh",
    title: "Sharh 'Umdat al-Fiqh",
    desc: "Commentary on 'Umdat al-Fiqh in Hanbali jurisprudence",
    topicIdx: 3,
    lessonDurationMin: 45,
    lessons: [227, 228, 229, 230, 231, 232, 233, 234, 235, 236].map((id) => ({
      id,
      slug: `fawzan-umdat-${id - 226}`,
    })),
  },
  {
    id: 204,
    scholarIdx: 2,
    slug: "arafat-masail-al-jahiliyyah",
    title: "Sharh Masail al-Jahiliyyah",
    desc: "Commentary on the issues of Jahiliyyah from the works of Muhammad ibn 'Abd al-Wahhab",
    topicIdx: 0,
    lessonDurationMin: 50,
    lessons: [237, 238, 239, 240, 241, 242, 243, 244, 245, 246].map((id) => ({
      id,
      slug: `arafat-masail-${id - 236}`,
    })),
  },
  {
    id: 205,
    scholarIdx: 2,
    slug: "arafat-risalah-ibn-abi-zayd",
    title: "Sharh Risalah Ibn Abi Zayd al-Qayrawani",
    desc: "Commentary on the classical Maliki fiqh treatise by Ibn Abi Zayd",
    topicIdx: 3,
    lessonDurationMin: 45,
    lessons: [247, 248, 249, 250, 251].map((id) => ({
      id,
      slug: `arafat-risalah-${id - 246}`,
    })),
  },
  {
    id: 206,
    scholarIdx: 3,
    slug: "mustafa-qawaid-al-irab",
    title: "Qawa'id al-I'rab",
    desc: "The grammatical rules of i'rab — a systematic study of Arabic syntax",
    topicIdx: 1,
    lessonDurationMin: 45,
    lessons: [252, 253, 254, 255, 256, 257, 258, 259, 260, 261].map((id) => ({
      id,
      slug: `mustafa-qawaid-${id - 251}`,
    })),
  },
  {
    id: 207,
    scholarIdx: 3,
    slug: "mustafa-sarf-al-muyassar",
    title: "Sarf al-Muyassar",
    desc: "Simplified study of Arabic morphology (sarf) and verb conjugation patterns",
    topicIdx: 1,
    lessonDurationMin: 40,
    lessons: [262, 263, 264, 265, 266].map((id) => ({
      id,
      slug: `mustafa-sarf-${id - 261}`,
    })),
  },
  {
    id: 208,
    scholarIdx: 4,
    slug: "bukhari-dawabit-al-jarh-wa-al-tadil",
    title: "Dawabit al-Jarh wa al-Ta'dil",
    desc: "Principles and controls of jarh wa ta'dil — evaluating hadith narrators",
    topicIdx: 2,
    lessonDurationMin: 50,
    lessons: [267, 268, 269, 270, 271].map((id) => ({
      id,
      slug: `bukhari-dawabit-${id - 266}`,
    })),
  },
  {
    id: 209,
    scholarIdx: 4,
    slug: "bukhari-al-jami-fi-ulum-al-hadith",
    title: "al-Jami' fi 'Ulum al-Hadith",
    desc: "A comprehensive study of hadith sciences — classification and methodology",
    topicIdx: 2,
    lessonDurationMin: 50,
    lessons: [272, 273, 274, 275, 276, 277, 278, 279, 280, 281].map((id) => ({
      id,
      slug: `bukhari-jami-${id - 271}`,
    })),
  },
];
