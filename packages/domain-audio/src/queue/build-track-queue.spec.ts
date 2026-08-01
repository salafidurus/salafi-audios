import type { ListingContentsDto } from "@sd/core-contracts";

import { describe, it, expect } from "bun:test";

import { buildTrackQueue, type QueueListingRef } from "./build-track-queue";

describe("buildTrackQueue", () => {
  const listing: QueueListingRef = {
    id: "listing-1",
    title: "Kitab at-Tawhid",
    format: "collection",
    scholarName: "Sheikh Al-Albani",
    scholarSlug: "al-albani",
    artworkUrl: "https://cdn.test/art.jpg",
  };

  it("builds a single-track queue for format 'single'", () => {
    const contents: ListingContentsDto = {
      format: "single",
      items: [
        {
          id: "l1",
          slug: "lecture-1",
          title: "The Ruling on Tawhid",
          durationSeconds: 1800,
          primaryAudioAsset: { id: "a1", url: "https://stream.test/l1.mp3" },
        },
      ],
    };

    const queue = buildTrackQueue({ ...listing, format: "single" }, contents);

    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      id: "l1",
      slug: "lecture-1",
      title: "The Ruling on Tawhid",
      artist: "Sheikh Al-Albani",
      scholarSlug: "al-albani",
      url: "https://stream.test/l1.mp3",
      durationSeconds: 1800,
      artworkUrl: "https://cdn.test/art.jpg",
    });
  });

  it("builds an ordered queue for format 'series', tagging each track with the series id/title", () => {
    const contents: ListingContentsDto = {
      format: "series",
      items: [
        {
          id: "l1",
          slug: "lesson-1",
          title: "Lesson 1",
          orderIndex: 0,
          durationSeconds: 600,
          primaryAudioAsset: { id: "a1", url: "https://stream.test/l1.mp3" },
        },
        {
          id: "l2",
          slug: "lesson-2",
          title: "Lesson 2",
          orderIndex: 1,
          durationSeconds: 700,
          primaryAudioAsset: { id: "a2", url: "https://stream.test/l2.mp3" },
        },
      ],
    };

    const queue = buildTrackQueue({ ...listing, id: "series-1", format: "series" }, contents);

    expect(queue.map((t) => t.id)).toEqual(["l1", "l2"]);
    expect(queue[0]).toMatchObject({
      seriesId: "series-1",
      seriesTitle: "Kitab at-Tawhid",
      orderIndex: 0,
    });
    expect(queue[1]).toMatchObject({
      seriesId: "series-1",
      seriesTitle: "Kitab at-Tawhid",
      orderIndex: 1,
    });
    // A series is never nested — module fields must stay unset.
    expect(queue[0]?.moduleId).toBeUndefined();
  });

  it("flattens a 'collection' queue in module order, crossing module boundaries correctly", () => {
    const contents: ListingContentsDto = {
      format: "collection",
      modules: [
        {
          id: "m1",
          slug: "module-1",
          title: "Module 1",
          lessons: [
            {
              id: "m1l1",
              slug: "m1-l1",
              title: "M1 Lesson 1",
              orderIndex: 0,
              durationSeconds: 300,
              primaryAudioAsset: { id: "a1", url: "https://stream.test/m1l1.mp3" },
            },
            {
              id: "m1l2",
              slug: "m1-l2",
              title: "M1 Lesson 2",
              orderIndex: 1,
              durationSeconds: 300,
              primaryAudioAsset: { id: "a2", url: "https://stream.test/m1l2.mp3" },
            },
          ],
        },
        {
          id: "m2",
          slug: "module-2",
          title: "Module 2",
          lessons: [
            {
              id: "m2l1",
              slug: "m2-l1",
              title: "M2 Lesson 1",
              orderIndex: 0,
              durationSeconds: 300,
              primaryAudioAsset: { id: "a3", url: "https://stream.test/m2l1.mp3" },
            },
          ],
        },
      ],
    };

    const queue = buildTrackQueue(listing, contents);

    // Must cross the module boundary in order: all of Module 1, then all of Module 2.
    expect(queue.map((t) => t.id)).toEqual(["m1l1", "m1l2", "m2l1"]);
    expect(queue[0]).toMatchObject({
      collectionId: "listing-1",
      moduleId: "m1",
      moduleTitle: "Module 1",
    });
    expect(queue[2]).toMatchObject({
      collectionId: "listing-1",
      moduleId: "m2",
      moduleTitle: "Module 2",
    });
    // A collection-nested lesson is never a standalone Series.
    expect(queue[0]?.seriesId).toBeUndefined();
  });

  it("eagerly resolves the URL only for the starting track, leaving the rest as lazy stubs", () => {
    const contents: ListingContentsDto = {
      format: "series",
      items: [
        {
          id: "l1",
          slug: "l1",
          title: "L1",
          primaryAudioAsset: { id: "a1", url: "https://stream.test/l1.mp3" },
        },
        {
          id: "l2",
          slug: "l2",
          title: "L2",
          primaryAudioAsset: { id: "a2", url: "https://stream.test/l2.mp3" },
        },
        {
          id: "l3",
          slug: "l3",
          title: "L3",
          primaryAudioAsset: { id: "a3", url: "https://stream.test/l3.mp3" },
        },
      ],
    };

    const queue = buildTrackQueue(listing, contents, { startAtId: "l2" });

    expect(queue[0]?.url).toBe("");
    expect(queue[1]?.url).toBe("https://stream.test/l2.mp3");
    expect(queue[2]?.url).toBe("");
  });

  it("defaults to eagerly resolving the first track's URL when no startAtId is given", () => {
    const contents: ListingContentsDto = {
      format: "series",
      items: [
        {
          id: "l1",
          slug: "l1",
          title: "L1",
          primaryAudioAsset: { id: "a1", url: "https://stream.test/l1.mp3" },
        },
        {
          id: "l2",
          slug: "l2",
          title: "L2",
          primaryAudioAsset: { id: "a2", url: "https://stream.test/l2.mp3" },
        },
      ],
    };

    const queue = buildTrackQueue(listing, contents);

    expect(queue[0]?.url).toBe("https://stream.test/l1.mp3");
    expect(queue[1]?.url).toBe("");
  });

  it("falls back to the audio asset's own duration and an empty url when data is missing", () => {
    const contents: ListingContentsDto = {
      format: "single",
      items: [
        {
          id: "l1",
          slug: "l1",
          title: "L1",
          primaryAudioAsset: { id: "a1", url: "", durationSeconds: 42 },
        },
      ],
    };

    const queue = buildTrackQueue({ ...listing, format: "single" }, contents);

    expect(queue[0]?.durationSeconds).toBe(42);
    expect(queue[0]?.url).toBe("");
  });
});
