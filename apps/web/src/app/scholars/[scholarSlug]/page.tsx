import type { Metadata } from "next";
import {
  getScholarMetadata,
  ScholarDetailScreen,
} from "@/features/library/screens/scholar-detail.screen";

type ScholarPageProps = {
  params: { scholarSlug: string };
};

export async function generateMetadata({ params }: ScholarPageProps): Promise<Metadata> {
  return getScholarMetadata({ params: Promise.resolve(params) });
}

export default async function ScholarPage({ params }: ScholarPageProps) {
  return <ScholarDetailScreen params={Promise.resolve(params)} />;
}
