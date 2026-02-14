import type { Metadata } from "next";
import { NowPlayingBar } from "@/features/library/components/audio/now-playing-bar/now-playing-bar";
import { Hero } from "@/features/home/components/hero/hero";
import { Tabs } from "@/features/home/components/recommendations/tabs/tabs.client";
import { StatsBand } from "@/features/navigation/components/stats-band/stats-band";
import "./home.css";
import { canonical } from "@/features/library/utils/seo";
import { loadHomeViewModel } from "@/features/home/utils/loader";

export function getHomeMetadata(): Metadata {
  return {
    title: "Browse",
    description: "Discover published scholars, series, and lectures in Salafi Durus.",
    alternates: { canonical: canonical("/") },
  };
}

export async function HomeScreen() {
  const model = await loadHomeViewModel();

  return (
    <main className="shell">
      <Hero items={model.heroItems} />
      <Tabs tabs={model.tabs} />

      {model.leadLecture ? (
        <NowPlayingBar
          title={model.leadLecture.title}
          scholar={model.leadLecture.scholarName}
          progressPercent={42}
        />
      ) : null}

      <StatsBand stats={model.stats} />
    </main>
  );
}
