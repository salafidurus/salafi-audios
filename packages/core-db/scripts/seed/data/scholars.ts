/**
 * Scholar seed data
 */

import { uuid } from "../helpers.js";

export interface ScholarData {
  id: string;
  slug: string;
  /** Main-language (Arabic) name/bio. */
  name: string;
  bio: string;
  /** English translation, mirrored into a ScholarTranslation on seed when present. */
  nameEn?: string;
  bioEn?: string;
  country: string;
  mainLanguage: "en" | "ar";
  title?: "allamah" | "sheikh" | "ustadh" | "akh";
  orderIndex?: number;
}

export const SCHOLARS: ScholarData[] = [
  {
    id: uuid(1),
    slug: "uthaymin",
    name: "محمد بن صالح العثيمين",
    bio: "الإمام العلَّامة، ومن أبرز علماء القرن الخامس عشر الهجري، وأحد أكثر العلماء رسوخًا في شتى علوم الشريعة الإسلامية. تتلمذ على أيدي الشيخ عبد الرحمن بن ناصر السعدي، والشيخ محمد الأمين الشنقيطي، والشيخ عبد العزيز بن عبد الله بن باز، وغيرهم من أهل العلم.",
    nameEn: "Muhammad ibn Salih al-Uthaymin",
    bioEn:
      "The great scholar, from the most foremost scholars of the 15th hijri century. He is a well-grounded scholar in almost all the fields of knowledge. He is from the students of Shaykh Abdrurahman As-Sa'adi, Shaykh Ameen Ash-Shinqiti, Shaykh Ibn Baaz and other than them.",
    country: "SA",
    mainLanguage: "ar",
    title: "allamah",
    orderIndex: 21,
  },
  {
    id: uuid(2),
    slug: "fawzan",
    name: "Salih ibn Fawzan al-Fawzan",
    bio: "The Grand Mufti of the Kingdom of Saudi Arabia. Expert in various field of Islamic knowledge: Aqeedah, Fiqh, Tafsir, etc.",
    country: "SA",
    mainLanguage: "ar",
    title: "allamah",
    orderIndex: 60,
  },
  {
    id: uuid(3),
    slug: "arafat",
    name: "عرفات بن حسن المحمدي",
    bio: "من أبرز علماء القرن الخامس عشر الهجري، عُرف بجهوده المباركة في تدريس العقيدة، والفقه، وسائر علوم الشريعة الإسلامية. تتلمذ على أيدي الشيخ ربيع بن هادي المدخلي، والشيخ عبيد بن عبد الله الجابري، والشيخ عبد الله بن عبد الرحيم البخاري، وغيرهم من كبار علماء هذا العصر.",
    nameEn: "Arafat bn Hasan Al-Muhammadi",
    bioEn:
      "A prominent scholar of the 15th hijri century known with keen efforts in teaching Aqeedah, Fiqh and various fields of knowledge. He was a student of Shaykh Rabee Al-Madkhali, Shaykh Ubayd Al-Jaabiri, Shaykh Abdullah Al-Bukhari and other than them from the senior scholars of this era.",
    country: "YE",
    mainLanguage: "ar",
    title: "sheikh",
    orderIndex: 60,
  },
  {
    id: uuid(4),
    slug: "mabram",
    name: "Mustafa bn Mabram",
    bio: "Specialist in Arabic grammar (nahw and sarf). Author of textbooks on i'rab.",
    country: "YE",
    mainLanguage: "ar",
    title: "sheikh",
    orderIndex: 30,
  },
  {
    id: uuid(5),
    slug: "bukhari",
    name: "عبد الله بن عبد الرحيم البخاري",
    bio: "من كبار العلماء والمحدِّثين في القرن الخامس عشر الهجري. شغل منصب أستاذٍ لعلم الحديث في الجامعة الإسلامية بالمدينة المنورة. تتلمذ على أيدي الشيخ محمد أمان الجامي، والشيخ عبد العزيز بن عبد الله بن باز، والشيخ صفي الرحمن المباركفوري، والشيخ أحمد بن يحيى النجمي، وغيرهم من كبار علماء هذا العصر.",
    nameEn: "Abdullah bn AbdirRaheem al-Bukhari",
    bioEn:
      "A senior scholar from the muhaddith of the 15th hijri century. He was a professor of Hadith Science in the Islamic University of Madina. He is from the students of Shaykh Muhammad Amaan Al-Jami, Shaykh Ibn Baaz, Shaykh Safiyyur-Rahman Al-Mubaarakfuri, Shaykh Ahmad An-Najmi, and many more senior scholars of our time.",
    country: "SA",
    mainLanguage: "ar",
    title: "allamah",
    orderIndex: 90,
  },
  {
    // Real (non-deterministic) id — added manually via the admin UI rather
    // than seeded originally, so it doesn't use the uuid() index scheme.
    id: "cms1qzxcd0000dqq4kj9f6i20",
    slug: "khalid",
    name: "خالد الظفيري",
    bio: "",
    nameEn: "Khalid Adh-Dhafiri",
    country: "KW",
    mainLanguage: "ar",
    title: "sheikh",
    orderIndex: 999,
  },
];
