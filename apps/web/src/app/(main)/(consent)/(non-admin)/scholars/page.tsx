import { ExploreScholarScreen } from "@/features/explore";

/** Documents this module's responsibility and public boundary. */
/** Static metadata for the public scholar directory route. */
export const metadata = {
  title: "Scholars",
  description: "Browse all scholars and their durus",
};

/** Renders the public scholar directory and its recommendation surface. */
export default function ScholarsPage() {
  return <ExploreScholarScreen />;
}
