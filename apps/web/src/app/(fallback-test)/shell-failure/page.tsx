import { notFound } from "next/navigation";

import { PublicShell } from "@/features/navigation/components/public-shell/public-shell";

export const dynamic = "force-dynamic";

export default function ShellFailureTestPage() {
  if (process.env.FALLBACK_TEST_MODE !== "1") {
    notFound();
  }

  return <PublicShell simulateFailure>Shell failure test</PublicShell>;
}
