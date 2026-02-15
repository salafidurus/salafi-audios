import type { Metadata } from "next";
import {
  getLectureMetadata,
  LectureDetailScreen,
} from "@/features/library/screens/lecture-detail/screen";

type LecturePageProps = {
  params: { scholarSlug: string; lectureSlug: string };
};

export async function generateMetadata({ params }: LecturePageProps): Promise<Metadata> {
  return getLectureMetadata({ params: Promise.resolve(params) });
}

export default async function LecturePage({ params }: LecturePageProps) {
  return <LectureDetailScreen params={Promise.resolve(params)} />;
}
