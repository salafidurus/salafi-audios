import type { Metadata } from "next";
import { Suspense } from "react";
import { NowPlayingBar } from "@/features/library/components/audio/now-playing-bar/now-playing-bar";
import { Hero } from "@/features/home/components/hero/hero";
import { Tabs } from "@/features/home/components/recommendations/tabs/tabs.client";
import { StatsBand } from "@/features/navigation/components/stats-band/stats-band";
import "./home.css";
import { canonical } from "@/features/library/utils/seo";
import {
  loadHomeHeroItems,
  loadHomeSeniorScholars,
  loadHomeStatsAndLeadLecture,
  loadHomeTabs,
} from "@/features/home/utils/loader";
import { SeniorScholarsSection } from "@/features/home/components/senior-scholars/senior-scholars.client";
import {
  HeroSkeleton,
  StatsSkeleton,
  TabsSkeleton,
} from "@/features/home/components/skeleton/skeleton";

export function getHomeMetadata(): Metadata {
  return {
    title: "Browse",
    description: "Discover published scholars, series, and lectures in Salafi Durus.",
    alternates: { canonical: canonical("/") },
  };
}

async function HomeHero() {
  const heroItems = await loadHomeHeroItems();
  return <Hero items={heroItems} />;
}

async function HomeTabs() {
  const tabs = await loadHomeTabs();
  return <Tabs tabs={tabs} />;
}

async function HomeSeniorScholars() {
  const scholars = await loadHomeSeniorScholars();
  if (scholars.length === 0) return null;

  return <SeniorScholarsSection scholars={scholars} />;
}

async function HomeStats() {
  const { stats, leadLecture } = await loadHomeStatsAndLeadLecture();

  return (
    <>
      {leadLecture ? (
        <NowPlayingBar
          title={leadLecture.title}
          scholar={leadLecture.scholarName}
          progressPercent={42}
        />
      ) : null}
      <StatsBand stats={stats} />
    </>
  );
}

export function HomeScreen() {
  return (
    <main className="shell">
      <Suspense fallback={<HeroSkeleton />}>
        <HomeHero />
      </Suspense>
      <Suspense fallback={null}>
        <HomeSeniorScholars />
      </Suspense>
      <Suspense fallback={<TabsSkeleton />}>
        <HomeTabs />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <HomeStats />
      </Suspense>
    </main>
  );
}
