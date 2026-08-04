import { Suspense } from "react";

import ScholarDetailInner from "./scholar-detail-inner";

export const metadata = {
  title: "Scholar",
  description: "View scholar profile and durus",
};

export default function ScholarPage() {
  return (
    <main className="flex flex-1 min-h-full flex-col">
      <Suspense fallback={null}>
        <ScholarDetailInner />
      </Suspense>
    </main>
  );
}
