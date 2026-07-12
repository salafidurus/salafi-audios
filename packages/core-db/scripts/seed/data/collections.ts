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
  {
    id: 300,
    scholarIdx: 0,
    slug: "uthaymin-sharh-al-mumti",
    title: "Sharh al-Mumti' li-Zad al-Mustaqni'",
    desc: "Encyclopedic commentary on al-Hajjawi's Zad al-Mustaqni' in Hanbali fiqh",
    topicIdx: 3,
    lessonDurationMin: 50,
    modules: [
      {
        id: 400,
        title: "Kitab al-Taharah",
        desc: "Purification",
        lessons: [
          {
            id: 500,
            slug: "uthaymin-sharh-al-mumti-mod-400-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-400-lsn-1.mp3",
          },
          {
            id: 501,
            slug: "uthaymin-sharh-al-mumti-mod-400-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-400-lsn-2.mp3",
          },
        ],
      },
      {
        id: 401,
        title: "Kitab al-Salah",
        desc: "Prayer",
        lessons: [
          {
            id: 502,
            slug: "uthaymin-sharh-al-mumti-mod-401-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-401-lsn-1.mp3",
          },
          {
            id: 503,
            slug: "uthaymin-sharh-al-mumti-mod-401-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-401-lsn-2.mp3",
          },
        ],
      },
      {
        id: 402,
        title: "Kitab al-Zakah",
        desc: "Zakat",
        lessons: [
          {
            id: 504,
            slug: "uthaymin-sharh-al-mumti-mod-402-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-402-lsn-1.mp3",
          },
          {
            id: 505,
            slug: "uthaymin-sharh-al-mumti-mod-402-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-402-lsn-2.mp3",
          },
        ],
      },
      {
        id: 403,
        title: "Kitab al-Sawm",
        desc: "Fasting",
        lessons: [
          {
            id: 506,
            slug: "uthaymin-sharh-al-mumti-mod-403-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-403-lsn-1.mp3",
          },
          {
            id: 507,
            slug: "uthaymin-sharh-al-mumti-mod-403-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-403-lsn-2.mp3",
          },
        ],
      },
      {
        id: 404,
        title: "Kitab al-Hajj",
        desc: "Pilgrimage",
        lessons: [
          {
            id: 508,
            slug: "uthaymin-sharh-al-mumti-mod-404-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-404-lsn-1.mp3",
          },
          {
            id: 509,
            slug: "uthaymin-sharh-al-mumti-mod-404-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-404-lsn-2.mp3",
          },
        ],
      },
      {
        id: 405,
        title: "Kitab al-Nikah",
        desc: "Marriage",
        lessons: [
          {
            id: 510,
            slug: "uthaymin-sharh-al-mumti-mod-405-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-405-lsn-1.mp3",
          },
          {
            id: 511,
            slug: "uthaymin-sharh-al-mumti-mod-405-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-405-lsn-2.mp3",
          },
        ],
      },
      {
        id: 406,
        title: "Kitab al-Talaq",
        desc: "Divorce",
        lessons: [
          {
            id: 512,
            slug: "uthaymin-sharh-al-mumti-mod-406-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-406-lsn-1.mp3",
          },
          {
            id: 513,
            slug: "uthaymin-sharh-al-mumti-mod-406-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-406-lsn-2.mp3",
          },
        ],
      },
      {
        id: 407,
        title: "Kitab al-Buyu'",
        desc: "Sales and Transactions",
        lessons: [
          {
            id: 514,
            slug: "uthaymin-sharh-al-mumti-mod-407-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-407-lsn-1.mp3",
          },
          {
            id: 515,
            slug: "uthaymin-sharh-al-mumti-mod-407-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-407-lsn-2.mp3",
          },
        ],
      },
      {
        id: 408,
        title: "Kitab al-Jana'iz",
        desc: "Funerals",
        lessons: [
          {
            id: 516,
            slug: "uthaymin-sharh-al-mumti-mod-408-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-408-lsn-1.mp3",
          },
          {
            id: 517,
            slug: "uthaymin-sharh-al-mumti-mod-408-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-408-lsn-2.mp3",
          },
        ],
      },
      {
        id: 409,
        title: "Kitab al-Ayman wa al-Nudhur",
        desc: "Oaths and Vows",
        lessons: [
          {
            id: 518,
            slug: "uthaymin-sharh-al-mumti-mod-409-lsn-1",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-409-lsn-1.mp3",
          },
          {
            id: 519,
            slug: "uthaymin-sharh-al-mumti-mod-409-lsn-2",
            audioUrl: "https://placeholder.dev/audio/uthaymin-sharh-al-mumti-mod-409-lsn-2.mp3",
          },
        ],
      },
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
      {
        id: 410,
        title: "al-Kalam wa al-Kalim",
        desc: "Speech and Word",
        lessons: [
          {
            id: 520,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-410-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-410-lsn-1.mp3",
          },
          {
            id: 521,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-410-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-410-lsn-2.mp3",
          },
        ],
      },
      {
        id: 411,
        title: "al-Fi'l",
        desc: "The Verb",
        lessons: [
          {
            id: 522,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-411-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-411-lsn-1.mp3",
          },
          {
            id: 523,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-411-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-411-lsn-2.mp3",
          },
        ],
      },
      {
        id: 412,
        title: "al-Ism",
        desc: "The Noun",
        lessons: [
          {
            id: 524,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-412-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-412-lsn-1.mp3",
          },
          {
            id: 525,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-412-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-412-lsn-2.mp3",
          },
        ],
      },
      {
        id: 413,
        title: "al-Harf",
        desc: "The Particle",
        lessons: [
          {
            id: 526,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-413-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-413-lsn-1.mp3",
          },
          {
            id: 527,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-413-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-413-lsn-2.mp3",
          },
        ],
      },
      {
        id: 414,
        title: "al-I'rab wa al-Bina'",
        desc: "Declension and Building",
        lessons: [
          {
            id: 528,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-414-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-414-lsn-1.mp3",
          },
          {
            id: 529,
            slug: "uthaymin-sharh-alfiyyah-ibn-malik-mod-414-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/uthaymin-sharh-alfiyyah-ibn-malik-mod-414-lsn-2.mp3",
          },
        ],
      },
    ],
  },
  {
    id: 302,
    scholarIdx: 1,
    slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah",
    title: "Sharh al-'Aqeedah al-Tahawiyyah",
    desc: "Commentary on the classical Tahawiyyah creed",
    topicIdx: 0,
    lessonDurationMin: 50,
    modules: [
      {
        id: 415,
        title: "Muqaddimah",
        desc: "Introduction",
        lessons: [
          {
            id: 530,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-415-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-415-lsn-1.mp3",
          },
          {
            id: 531,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-415-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-415-lsn-2.mp3",
          },
        ],
      },
      {
        id: 416,
        title: "al-Tawhid",
        desc: "Oneness of Allah",
        lessons: [
          {
            id: 532,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-416-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-416-lsn-1.mp3",
          },
          {
            id: 533,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-416-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-416-lsn-2.mp3",
          },
        ],
      },
      {
        id: 417,
        title: "al-Qada' wa al-Qadr",
        desc: "Predestination",
        lessons: [
          {
            id: 534,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-417-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-417-lsn-1.mp3",
          },
          {
            id: 535,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-417-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-417-lsn-2.mp3",
          },
        ],
      },
      {
        id: 418,
        title: "al-Qur'an",
        desc: "The Qur'an",
        lessons: [
          {
            id: 536,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-418-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-418-lsn-1.mp3",
          },
          {
            id: 537,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-418-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-418-lsn-2.mp3",
          },
        ],
      },
      {
        id: 419,
        title: "al-Ru'yat",
        desc: "Seeing Allah",
        lessons: [
          {
            id: 538,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-419-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-419-lsn-1.mp3",
          },
          {
            id: 539,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-419-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-419-lsn-2.mp3",
          },
        ],
      },
      {
        id: 420,
        title: "al-Nubuwwat",
        desc: "Prophethood",
        lessons: [
          {
            id: 540,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-420-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-420-lsn-1.mp3",
          },
          {
            id: 541,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-420-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-420-lsn-2.mp3",
          },
        ],
      },
      {
        id: 421,
        title: "al-Mala'ikah",
        desc: "Angels",
        lessons: [
          {
            id: 542,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-421-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-421-lsn-1.mp3",
          },
          {
            id: 543,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-421-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-421-lsn-2.mp3",
          },
        ],
      },
      {
        id: 422,
        title: "al-Sahabah",
        desc: "Companions",
        lessons: [
          {
            id: 544,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-422-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-422-lsn-1.mp3",
          },
          {
            id: 545,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-422-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-422-lsn-2.mp3",
          },
        ],
      },
      {
        id: 423,
        title: "al-Shafa'ah",
        desc: "Intercession",
        lessons: [
          {
            id: 546,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-423-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-423-lsn-1.mp3",
          },
          {
            id: 547,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-423-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-423-lsn-2.mp3",
          },
        ],
      },
      {
        id: 424,
        title: "al-Akhir wa al-Jannah wa al-Nar",
        desc: "Hereafter, Paradise, and Hellfire",
        lessons: [
          {
            id: 548,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-424-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-424-lsn-1.mp3",
          },
          {
            id: 549,
            slug: "fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-424-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-sharh-al-aqeedah-al-tahawiyyah-mod-424-lsn-2.mp3",
          },
        ],
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
      {
        id: 425,
        title: "Fatawa al-Aqeedah",
        desc: "Creed-related verdicts",
        lessons: [
          {
            id: 550,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-425-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-425-lsn-1.mp3",
          },
          {
            id: 551,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-425-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-425-lsn-2.mp3",
          },
        ],
      },
      {
        id: 426,
        title: "Fatawa al-Salah",
        desc: "Prayer rulings",
        lessons: [
          {
            id: 552,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-426-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-426-lsn-1.mp3",
          },
          {
            id: 553,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-426-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-426-lsn-2.mp3",
          },
        ],
      },
      {
        id: 427,
        title: "Fatawa al-Zakah wa al-Sawm",
        desc: "Zakat and fasting",
        lessons: [
          {
            id: 554,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-427-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-427-lsn-1.mp3",
          },
          {
            id: 555,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-427-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-427-lsn-2.mp3",
          },
        ],
      },
      {
        id: 428,
        title: "Fatawa al-Nikah wa al-Talaq",
        desc: "Marriage and divorce",
        lessons: [
          {
            id: 556,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-428-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-428-lsn-1.mp3",
          },
          {
            id: 557,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-428-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-428-lsn-2.mp3",
          },
        ],
      },
      {
        id: 429,
        title: "Fatawa al-Mu'amalat",
        desc: "Transactions",
        lessons: [
          {
            id: 558,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-429-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-429-lsn-1.mp3",
          },
          {
            id: 559,
            slug: "fawzan-al-muntaqa-min-fatawa-mod-429-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/fawzan-al-muntaqa-min-fatawa-mod-429-lsn-2.mp3",
          },
        ],
      },
    ],
  },
  {
    id: 304,
    scholarIdx: 2,
    slug: "arafat-sharh-abwab-mukhtarah",
    title: "Sharh Abwab Mukhtarah min Sahih al-Bukhari",
    desc: "Selected chapters from Sahih al-Bukhari on key topics",
    topicIdx: 2,
    lessonDurationMin: 45,
    modules: [
      {
        id: 430,
        title: "Kitab al-Fitan",
        desc: "Trials and tribulations",
        lessons: [
          {
            id: 560,
            slug: "arafat-sharh-abwab-mukhtarah-mod-430-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-430-lsn-1.mp3",
          },
          {
            id: 561,
            slug: "arafat-sharh-abwab-mukhtarah-mod-430-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-430-lsn-2.mp3",
          },
          {
            id: 562,
            slug: "arafat-sharh-abwab-mukhtarah-mod-430-lsn-3",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-430-lsn-3.mp3",
          },
        ],
      },
      {
        id: 431,
        title: "Kitab al-Tawhid",
        desc: "Oneness of Allah",
        lessons: [
          {
            id: 563,
            slug: "arafat-sharh-abwab-mukhtarah-mod-431-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-431-lsn-1.mp3",
          },
          {
            id: 564,
            slug: "arafat-sharh-abwab-mukhtarah-mod-431-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-431-lsn-2.mp3",
          },
          {
            id: 565,
            slug: "arafat-sharh-abwab-mukhtarah-mod-431-lsn-3",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-431-lsn-3.mp3",
          },
        ],
      },
      {
        id: 432,
        title: "Fadha'il al-Sahabah",
        desc: "Virtues of the Companions",
        lessons: [
          {
            id: 566,
            slug: "arafat-sharh-abwab-mukhtarah-mod-432-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-432-lsn-1.mp3",
          },
          {
            id: 567,
            slug: "arafat-sharh-abwab-mukhtarah-mod-432-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/arafat-sharh-abwab-mukhtarah-mod-432-lsn-2.mp3",
          },
        ],
      },
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
      {
        id: 433,
        title: "al-Manhaj",
        desc: "Methodology",
        lessons: [
          {
            id: 568,
            slug: "arafat-majmu-al-fatawa-mod-433-lsn-1",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-433-lsn-1.mp3",
          },
          {
            id: 569,
            slug: "arafat-majmu-al-fatawa-mod-433-lsn-2",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-433-lsn-2.mp3",
          },
        ],
      },
      {
        id: 434,
        title: "al-Aqeedah",
        desc: "Creed",
        lessons: [
          {
            id: 570,
            slug: "arafat-majmu-al-fatawa-mod-434-lsn-1",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-434-lsn-1.mp3",
          },
          {
            id: 571,
            slug: "arafat-majmu-al-fatawa-mod-434-lsn-2",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-434-lsn-2.mp3",
          },
          {
            id: 572,
            slug: "arafat-majmu-al-fatawa-mod-434-lsn-3",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-434-lsn-3.mp3",
          },
        ],
      },
      {
        id: 435,
        title: "al-Ibadat",
        desc: "Worship",
        lessons: [
          {
            id: 573,
            slug: "arafat-majmu-al-fatawa-mod-435-lsn-1",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-435-lsn-1.mp3",
          },
          {
            id: 574,
            slug: "arafat-majmu-al-fatawa-mod-435-lsn-2",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-435-lsn-2.mp3",
          },
          {
            id: 575,
            slug: "arafat-majmu-al-fatawa-mod-435-lsn-3",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-435-lsn-3.mp3",
          },
        ],
      },
      {
        id: 436,
        title: "al-Bay'",
        desc: "Transactions",
        lessons: [
          {
            id: 576,
            slug: "arafat-majmu-al-fatawa-mod-436-lsn-1",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-436-lsn-1.mp3",
          },
          {
            id: 577,
            slug: "arafat-majmu-al-fatawa-mod-436-lsn-2",
            audioUrl: "https://placeholder.dev/audio/arafat-majmu-al-fatawa-mod-436-lsn-2.mp3",
          },
        ],
      },
    ],
  },
  {
    id: 306,
    scholarIdx: 3,
    slug: "mustafa-al-mukhtar-min-al-nahw",
    title: "al-Mukhtar min al-Nahw",
    desc: "Selected topics in Arabic grammar — a structured study of nahw",
    topicIdx: 1,
    lessonDurationMin: 40,
    modules: [
      {
        id: 437,
        title: "Muqaddimah",
        desc: "Introduction to nahw",
        lessons: [
          {
            id: 578,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-437-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-437-lsn-1.mp3",
          },
          {
            id: 579,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-437-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-437-lsn-2.mp3",
          },
        ],
      },
      {
        id: 438,
        title: "al-Jumlah al-Ismiyyah",
        desc: "Nominal sentence",
        lessons: [
          {
            id: 580,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-438-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-438-lsn-1.mp3",
          },
          {
            id: 581,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-438-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-438-lsn-2.mp3",
          },
        ],
      },
      {
        id: 439,
        title: "al-Jumlah al-Fi'liyyah",
        desc: "Verbal sentence",
        lessons: [
          {
            id: 582,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-439-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-439-lsn-1.mp3",
          },
          {
            id: 583,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-439-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-439-lsn-2.mp3",
          },
        ],
      },
      {
        id: 440,
        title: "al-Maf'ulat",
        desc: "Objects",
        lessons: [
          {
            id: 584,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-440-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-440-lsn-1.mp3",
          },
          {
            id: 585,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-440-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-440-lsn-2.mp3",
          },
        ],
      },
      {
        id: 441,
        title: "al-Majrurat",
        desc: "Genitive constructions",
        lessons: [
          {
            id: 586,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-441-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-441-lsn-1.mp3",
          },
          {
            id: 587,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-441-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-441-lsn-2.mp3",
          },
        ],
      },
      {
        id: 442,
        title: "al-Tawabi'",
        desc: "Apposition",
        lessons: [
          {
            id: 588,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-442-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-442-lsn-1.mp3",
          },
          {
            id: 589,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-442-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-442-lsn-2.mp3",
          },
        ],
      },
      {
        id: 443,
        title: "al-Mustathniyat",
        desc: "Exceptions",
        lessons: [
          {
            id: 590,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-443-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-443-lsn-1.mp3",
          },
          {
            id: 591,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-443-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-443-lsn-2.mp3",
          },
        ],
      },
      {
        id: 444,
        title: "al-Munadat",
        desc: "Vocative",
        lessons: [
          {
            id: 592,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-444-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-444-lsn-1.mp3",
          },
          {
            id: 593,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-444-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-444-lsn-2.mp3",
          },
        ],
      },
      {
        id: 445,
        title: "al-Tamyiz wa al-Hal",
        desc: "Distinction and circumstance",
        lessons: [
          {
            id: 594,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-445-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-445-lsn-1.mp3",
          },
          {
            id: 595,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-445-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-445-lsn-2.mp3",
          },
        ],
      },
      {
        id: 446,
        title: "al-Asalib al-Nahwiyyah",
        desc: "Grammatical constructions",
        lessons: [
          {
            id: 596,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-446-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-446-lsn-1.mp3",
          },
          {
            id: 597,
            slug: "mustafa-al-mukhtar-min-al-nahw-mod-446-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/mustafa-al-mukhtar-min-al-nahw-mod-446-lsn-2.mp3",
          },
        ],
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
      {
        id: 447,
        title: "Kitab al-Tawhid",
        desc: "Book of Tawheed",
        lessons: [
          {
            id: 598,
            slug: "mustafa-sharh-fath-al-majid-mod-447-lsn-1",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-447-lsn-1.mp3",
          },
          {
            id: 599,
            slug: "mustafa-sharh-fath-al-majid-mod-447-lsn-2",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-447-lsn-2.mp3",
          },
        ],
      },
      {
        id: 448,
        title: "Bab al-Shirk",
        desc: "Chapter of Shirk",
        lessons: [
          {
            id: 600,
            slug: "mustafa-sharh-fath-al-majid-mod-448-lsn-1",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-448-lsn-1.mp3",
          },
          {
            id: 601,
            slug: "mustafa-sharh-fath-al-majid-mod-448-lsn-2",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-448-lsn-2.mp3",
          },
        ],
      },
      {
        id: 449,
        title: "Bab al-Kibr wa al-Riya'",
        desc: "Pride and showing off",
        lessons: [
          {
            id: 602,
            slug: "mustafa-sharh-fath-al-majid-mod-449-lsn-1",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-449-lsn-1.mp3",
          },
          {
            id: 603,
            slug: "mustafa-sharh-fath-al-majid-mod-449-lsn-2",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-449-lsn-2.mp3",
          },
        ],
      },
      {
        id: 450,
        title: "Bab al-Sihr wa al-Tatayyur",
        desc: "Sorcery and omens",
        lessons: [
          {
            id: 604,
            slug: "mustafa-sharh-fath-al-majid-mod-450-lsn-1",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-450-lsn-1.mp3",
          },
          {
            id: 605,
            slug: "mustafa-sharh-fath-al-majid-mod-450-lsn-2",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-450-lsn-2.mp3",
          },
        ],
      },
      {
        id: 451,
        title: "Bab al-'Izzah",
        desc: "Chapter of honor",
        lessons: [
          {
            id: 606,
            slug: "mustafa-sharh-fath-al-majid-mod-451-lsn-1",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-451-lsn-1.mp3",
          },
          {
            id: 607,
            slug: "mustafa-sharh-fath-al-majid-mod-451-lsn-2",
            audioUrl: "https://placeholder.dev/audio/mustafa-sharh-fath-al-majid-mod-451-lsn-2.mp3",
          },
        ],
      },
    ],
  },
  {
    id: 308,
    scholarIdx: 4,
    slug: "bukhari-majmu-al-hadith",
    title: "Majmu' al-Hadith",
    desc: "A comprehensive collection of hadith with explanatory commentary and analysis of chains",
    topicIdx: 2,
    lessonDurationMin: 50,
    modules: [
      {
        id: 452,
        title: "Kitab al-Wahyi",
        desc: "Revelation",
        lessons: [
          {
            id: 608,
            slug: "bukhari-majmu-al-hadith-mod-452-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-452-lsn-1.mp3",
          },
          {
            id: 609,
            slug: "bukhari-majmu-al-hadith-mod-452-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-452-lsn-2.mp3",
          },
        ],
      },
      {
        id: 453,
        title: "Kitab al-Iman",
        desc: "Faith",
        lessons: [
          {
            id: 610,
            slug: "bukhari-majmu-al-hadith-mod-453-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-453-lsn-1.mp3",
          },
          {
            id: 611,
            slug: "bukhari-majmu-al-hadith-mod-453-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-453-lsn-2.mp3",
          },
        ],
      },
      {
        id: 454,
        title: "Kitab al-'Ilm",
        desc: "Knowledge",
        lessons: [
          {
            id: 612,
            slug: "bukhari-majmu-al-hadith-mod-454-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-454-lsn-1.mp3",
          },
          {
            id: 613,
            slug: "bukhari-majmu-al-hadith-mod-454-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-454-lsn-2.mp3",
          },
        ],
      },
      {
        id: 455,
        title: "Kitab al-Taharah",
        desc: "Purification",
        lessons: [
          {
            id: 614,
            slug: "bukhari-majmu-al-hadith-mod-455-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-455-lsn-1.mp3",
          },
          {
            id: 615,
            slug: "bukhari-majmu-al-hadith-mod-455-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-455-lsn-2.mp3",
          },
        ],
      },
      {
        id: 456,
        title: "Kitab al-Salah",
        desc: "Prayer",
        lessons: [
          {
            id: 616,
            slug: "bukhari-majmu-al-hadith-mod-456-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-456-lsn-1.mp3",
          },
          {
            id: 617,
            slug: "bukhari-majmu-al-hadith-mod-456-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-456-lsn-2.mp3",
          },
        ],
      },
      {
        id: 457,
        title: "Kitab al-Zakah",
        desc: "Zakat",
        lessons: [
          {
            id: 618,
            slug: "bukhari-majmu-al-hadith-mod-457-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-457-lsn-1.mp3",
          },
          {
            id: 619,
            slug: "bukhari-majmu-al-hadith-mod-457-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-457-lsn-2.mp3",
          },
        ],
      },
      {
        id: 458,
        title: "Kitab al-Sawm",
        desc: "Fasting",
        lessons: [
          {
            id: 620,
            slug: "bukhari-majmu-al-hadith-mod-458-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-458-lsn-1.mp3",
          },
          {
            id: 621,
            slug: "bukhari-majmu-al-hadith-mod-458-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-458-lsn-2.mp3",
          },
        ],
      },
      {
        id: 459,
        title: "Kitab al-Hajj",
        desc: "Pilgrimage",
        lessons: [
          {
            id: 622,
            slug: "bukhari-majmu-al-hadith-mod-459-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-459-lsn-1.mp3",
          },
          {
            id: 623,
            slug: "bukhari-majmu-al-hadith-mod-459-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-459-lsn-2.mp3",
          },
        ],
      },
      {
        id: 460,
        title: "Kitab al-Jihad",
        desc: "Striving",
        lessons: [
          {
            id: 624,
            slug: "bukhari-majmu-al-hadith-mod-460-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-460-lsn-1.mp3",
          },
          {
            id: 625,
            slug: "bukhari-majmu-al-hadith-mod-460-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-460-lsn-2.mp3",
          },
        ],
      },
      {
        id: 461,
        title: "Kitab al-Adab",
        desc: "Etiquette",
        lessons: [
          {
            id: 626,
            slug: "bukhari-majmu-al-hadith-mod-461-lsn-1",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-461-lsn-1.mp3",
          },
          {
            id: 627,
            slug: "bukhari-majmu-al-hadith-mod-461-lsn-2",
            audioUrl: "https://placeholder.dev/audio/bukhari-majmu-al-hadith-mod-461-lsn-2.mp3",
          },
        ],
      },
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
      {
        id: 462,
        title: "al-Hadith al-Sahih",
        desc: "Authentic hadith",
        lessons: [
          {
            id: 628,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-462-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-462-lsn-1.mp3",
          },
          {
            id: 629,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-462-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-462-lsn-2.mp3",
          },
          {
            id: 630,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-462-lsn-3",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-462-lsn-3.mp3",
          },
        ],
      },
      {
        id: 463,
        title: "al-Hadith al-Hasan",
        desc: "Good hadith",
        lessons: [
          {
            id: 631,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-463-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-463-lsn-1.mp3",
          },
          {
            id: 632,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-463-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-463-lsn-2.mp3",
          },
        ],
      },
      {
        id: 464,
        title: "al-Hadith al-Da'if",
        desc: "Weak hadith",
        lessons: [
          {
            id: 633,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-464-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-464-lsn-1.mp3",
          },
          {
            id: 634,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-464-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-464-lsn-2.mp3",
          },
        ],
      },
      {
        id: 465,
        title: "al-Jarh wa al-Ta'dil",
        desc: "Impugning and accrediting",
        lessons: [
          {
            id: 635,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-465-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-465-lsn-1.mp3",
          },
          {
            id: 636,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-465-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-465-lsn-2.mp3",
          },
        ],
      },
      {
        id: 466,
        title: "Tabaqat al-Muhaddithin",
        desc: "Generations of hadith scholars",
        lessons: [
          {
            id: 637,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-466-lsn-1",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-466-lsn-1.mp3",
          },
          {
            id: 638,
            slug: "bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-466-lsn-2",
            audioUrl:
              "https://placeholder.dev/audio/bukhari-al-mukhtasar-fi-mustalah-al-hadith-mod-466-lsn-2.mp3",
          },
        ],
      },
    ],
  },
];
