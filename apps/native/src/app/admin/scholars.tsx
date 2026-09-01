import { useRouter } from "expo-router";

import { AdminScholarsScreen } from "@/features/admin/screens/admin-scholars/admin-scholars.screen";

/** Defines the independent Admin scholars route outside the persistent tab shell. */
/** Exposes scholar management outside the tabs and keeps detail navigation inside the Admin stack. */
export default function AdminScholarsRoute() {
  const router = useRouter();

  return (
    <AdminScholarsScreen
      onNavigateToScholar={(slug) =>
        router.push({ pathname: "/admin/scholar-detail", params: { slug } })
      }
    />
  );
}
