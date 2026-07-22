import { redirect } from "next/navigation";

export default async function ScholarRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/scholars/${slug}`);
}
