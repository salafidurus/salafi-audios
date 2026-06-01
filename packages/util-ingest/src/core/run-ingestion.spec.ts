import { Status } from "@sd/core-db";
import { parseDate, computePublishedAt, computePublishedLectureAggregates } from "./run-ingestion";

describe("parseDate", () => {
  it("returns null for undefined input", () => {
    expect(parseDate(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseDate("")).toBeNull();
  });

  it("returns Date object for valid date string", () => {
    const dateString = "2023-10-15T10:30:00Z";
    const result = parseDate(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2023-10-15T10:30:00.000Z");
  });

  it("returns Date object for ISO date string", () => {
    const dateString = "2023-10-15T10:30:00.000Z";
    const result = parseDate(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe(dateString);
  });
});

describe("computePublishedAt", () => {
  it("returns Date from publishedAt string when provided", () => {
    const publishedAt = "2023-10-15T10:30:00Z";
    const result = computePublishedAt(Status.draft, publishedAt);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2023-10-15T10:30:00.000Z");
  });

  it("returns current Date when status is published and no publishedAt", () => {
    const before = new Date();
    const result = computePublishedAt(Status.published);
    const after = new Date();

    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result!.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("returns null when status is not published and no publishedAt", () => {
    expect(computePublishedAt(Status.draft)).toBeNull();
    expect(computePublishedAt(Status.archived)).toBeNull();
  });

  it("prioritizes publishedAt over status", () => {
    const publishedAt = "2023-10-15T10:30:00Z";
    const result = computePublishedAt(Status.draft, publishedAt);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2023-10-15T10:30:00.000Z");
  });
});

describe("computePublishedLectureAggregates", () => {
  const createLecture = (status: Status, durationSeconds?: number, deletedAt?: string) => ({
    slug: "test-lecture",
    title: "Test Lecture",
    status,
    durationSeconds,
    deletedAt,
    topicSlugs: [],
    audioAssets: [],
  });

  it("returns zero counts for empty lecture array", () => {
    const result = computePublishedLectureAggregates([]);
    expect(result).toEqual({
      publishedLectureCount: 0,
      publishedDurationSeconds: 0,
    });
  });

  it("returns zero counts when no lectures are published", () => {
    const lectures = [createLecture(Status.draft, 100), createLecture(Status.archived, 200)];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 0,
      publishedDurationSeconds: 0,
    });
  });

  it("excludes deleted lectures from count", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published, 200, "2023-10-15T10:30:00Z"),
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 1,
      publishedDurationSeconds: 100,
    });
  });

  it("includes lectures with falsy deletedAt (whitespace becomes empty after trim)", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published, 200, "   "), // whitespace becomes empty after trim, so included
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 2,
      publishedDurationSeconds: 300,
    });
  });

  it("counts published lectures correctly", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published, 200),
      createLecture(Status.draft, 300),
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 2,
      publishedDurationSeconds: 300,
    });
  });

  it("returns null duration when some published lectures have no duration", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published), // no duration
      createLecture(Status.published, 200),
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 3,
      publishedDurationSeconds: null,
    });
  });

  it("returns null duration when published lecture has invalid duration", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published, NaN),
      createLecture(Status.published, 200),
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 3,
      publishedDurationSeconds: null,
    });
  });

  it("returns null duration when published lecture has infinite duration", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published, Infinity),
      createLecture(Status.published, 200),
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 3,
      publishedDurationSeconds: null,
    });
  });

  it("sums durations correctly for published lectures only", () => {
    const lectures = [
      createLecture(Status.published, 100),
      createLecture(Status.published, 250),
      createLecture(Status.draft, 1000), // should be ignored
      createLecture(Status.published, 150),
    ];
    const result = computePublishedLectureAggregates(lectures);
    expect(result).toEqual({
      publishedLectureCount: 3,
      publishedDurationSeconds: 500,
    });
  });
});
