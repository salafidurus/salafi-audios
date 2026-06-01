import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const toLocale = (val: string | null): string | null => {
    if (!val) return null;
    const lower = val.toLowerCase();
    if (lower.includes("ar") || lower === "arabic") return "ar";
    if (lower.includes("en") || lower === "english") return "en";
    return null;
  };

  for (const lecture of await prisma.$queryRaw<{ id: string; language: string | null }[]>`
    SELECT id, language FROM "Lecture" WHERE language IS NOT NULL
  `) {
    const normalized = toLocale(lecture.language);
    if (normalized) {
      await prisma.$executeRaw`
        UPDATE "Lecture" SET language = ${normalized}::"Locale" WHERE id = ${lecture.id}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "Lecture" SET language = NULL WHERE id = ${lecture.id}
      `;
    }
  }
}

main().finally(() => prisma.$disconnect());
