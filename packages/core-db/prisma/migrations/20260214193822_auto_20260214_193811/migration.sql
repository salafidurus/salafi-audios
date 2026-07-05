-- CreateEnum
CREATE TYPE "RecommendationRecurrence" AS ENUM ('none', 'yearly');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "recommendationEndAt" TIMESTAMP(3),
ADD COLUMN     "recommendationOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommendationRecurrence" "RecommendationRecurrence" DEFAULT 'none',
ADD COLUMN     "recommendationStartAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "recommendationEndAt" TIMESTAMP(3),
ADD COLUMN     "recommendationOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommendationRecurrence" "RecommendationRecurrence" DEFAULT 'none',
ADD COLUMN     "recommendationStartAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Scholar" ADD COLUMN     "isKibar" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "recommendationEndAt" TIMESTAMP(3),
ADD COLUMN     "recommendationOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommendationRecurrence" "RecommendationRecurrence" DEFAULT 'none',
ADD COLUMN     "recommendationStartAt" TIMESTAMP(3);
