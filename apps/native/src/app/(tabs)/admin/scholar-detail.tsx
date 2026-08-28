import { useLocalSearchParams } from "expo-router";

import { AdminScholarDetailScreen } from "@/features/admin/screens/admin-scholar-detail/admin-scholar-detail.screen";

/** Provides the native app (tabs) admin scholar-detail module responsibility. */
/** Describes the AdminScholarDetailRoute native function contract and behavior. */
export default function AdminScholarDetailRoute() {
  /** Describes the slug native field contract and behavior. */
  const { slug } = useLocalSearchParams<{
    /** Describes the slug native field contract and behavior. */
    slug: string;
  }>();

  return <AdminScholarDetailScreen scholarSlug={slug ?? ""} />;
}
