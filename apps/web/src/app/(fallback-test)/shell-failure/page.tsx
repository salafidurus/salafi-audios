import { notFound } from "next/navigation";

import { PublicShell } from "@/features/navigation/components/public-shell/public-shell";

/** Documents this module's responsibility and public boundary. */
/** Forces this test route to exercise the runtime shell-failure path. */
export const dynamic = "force-dynamic";

/** Intentionally throws so fallback-shell recovery can be exercised in E2E tests. */
export default function ShellFailureTestPage() {
  if (process.env.FALLBACK_TEST_MODE !== "1") {
    notFound();
  }

  return <PublicShell simulateFailure>Shell failure test</PublicShell>;
}
