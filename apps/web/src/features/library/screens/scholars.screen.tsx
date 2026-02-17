import { publicApi } from "@/features/home/api/public-api";
import { ScholarsScreenClient } from "./scholars.screen.client";

export async function ScholarsScreen() {
  const [scholars, topics] = await Promise.all([
    (async () => {
      try {
        return await publicApi.listScholars();
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        return await publicApi.listTopics();
      } catch {
        return [];
      }
    })(),
  ]);

  return <ScholarsScreenClient scholars={scholars} topics={topics} />;
}
