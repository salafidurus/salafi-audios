import { Prisma } from "@sd/core-db";
import {
  upsertTopics,
  syncCollectionTopics,
  syncSeriesTopics,
  syncLectureTopics,
} from "./topic-sync";
import { TopicDef } from "../schema/content-schema";

// Mock transaction client
const createMockTx = () => {
  const mockTx: Partial<Prisma.TransactionClient> = {
    topic: {
      upsert: jest.fn(),
    } as any,
    collectionTopic: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    } as any,
    seriesTopic: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    } as any,
    lectureTopic: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    } as any,
  };
  return mockTx as Prisma.TransactionClient;
};

describe("upsertTopics", () => {
  it("handles empty topics array", async () => {
    const tx = createMockTx();
    const result = await upsertTopics(tx, []);
    expect(result.size).toBe(0);
  });

  it("upserts root topics first", async () => {
    const tx = createMockTx();
    const mockTopicUpsert = tx.topic.upsert as jest.Mock;

    mockTopicUpsert.mockResolvedValue({
      id: "topic-1-id",
      slug: "topic-1",
    });

    const topics: TopicDef[] = [{ slug: "topic-1", name: "Topic 1" }];

    const result = await upsertTopics(tx, topics);

    expect(mockTopicUpsert).toHaveBeenCalledWith({
      where: { slug: "topic-1" },
      create: { slug: "topic-1", name: "Topic 1" },
      update: { name: "Topic 1" },
      select: { id: true, slug: true },
    });

    expect(result.get("topic-1")).toBe("topic-1-id");
  });

  it("upserts child topics after parents", async () => {
    const tx = createMockTx();
    const mockTopicUpsert = tx.topic.upsert as jest.Mock;

    // Mock parent topic upsert
    mockTopicUpsert
      .mockResolvedValueOnce({
        id: "parent-id",
        slug: "parent",
      })
      .mockResolvedValueOnce({
        id: "child-id",
        slug: "child",
      });

    const topics: TopicDef[] = [
      { slug: "child", name: "Child Topic", parentSlug: "parent" },
      { slug: "parent", name: "Parent Topic" },
    ];

    const result = await upsertTopics(tx, topics);

    expect(mockTopicUpsert).toHaveBeenNthCalledWith(1, {
      where: { slug: "parent" },
      create: { slug: "parent", name: "Parent Topic" },
      update: { name: "Parent Topic" },
      select: { id: true, slug: true },
    });

    expect(mockTopicUpsert).toHaveBeenNthCalledWith(2, {
      where: { slug: "child" },
      create: { slug: "child", name: "Child Topic", parentId: "parent-id" },
      update: { name: "Child Topic", parentId: "parent-id" },
      select: { id: true, slug: true },
    });

    expect(result.get("parent")).toBe("parent-id");
    expect(result.get("child")).toBe("child-id");
  });

  it("handles multiple generations of topics", async () => {
    const tx = createMockTx();
    const mockTopicUpsert = tx.topic.upsert as jest.Mock;

    mockTopicUpsert
      .mockResolvedValueOnce({ id: "grandparent-id", slug: "grandparent" })
      .mockResolvedValueOnce({ id: "parent-id", slug: "parent" })
      .mockResolvedValueOnce({ id: "child-id", slug: "child" });

    const topics: TopicDef[] = [
      { slug: "child", name: "Child", parentSlug: "parent" },
      { slug: "parent", name: "Parent", parentSlug: "grandparent" },
      { slug: "grandparent", name: "Grandparent" },
    ];

    const result = await upsertTopics(tx, topics);

    expect(result.size).toBe(3);
    expect(result.get("grandparent")).toBe("grandparent-id");
    expect(result.get("parent")).toBe("parent-id");
    expect(result.get("child")).toBe("child-id");
  });

  it("throws error for unresolvable parent relationships", async () => {
    const tx = createMockTx();
    const mockTopicUpsert = tx.topic.upsert as jest.Mock;

    // Only return parent topic, child will have missing parent reference
    mockTopicUpsert.mockResolvedValue({
      id: "parent-id",
      slug: "parent",
    });

    const topics: TopicDef[] = [
      { slug: "child", name: "Child", parentSlug: "missing-parent" },
      { slug: "parent", name: "Parent" },
    ];

    await expect(upsertTopics(tx, topics)).rejects.toThrow(
      "Unable to resolve topic parent relationships.",
    );
  });
});

describe("syncCollectionTopics", () => {
  it("deletes existing topics and creates new ones", async () => {
    const tx = createMockTx();
    const mockDeleteMany = tx.collectionTopic.deleteMany as jest.Mock;
    const mockCreateMany = tx.collectionTopic.createMany as jest.Mock;

    const topicIdBySlug = new Map([
      ["topic-1", "id-1"],
      ["topic-2", "id-2"],
    ]);

    await syncCollectionTopics(tx, "collection-id", ["topic-1", "topic-2"], topicIdBySlug);

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        collectionId: "collection-id",
        topicId: { notIn: ["id-1", "id-2"] },
      },
    });

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        { collectionId: "collection-id", topicId: "id-1" },
        { collectionId: "collection-id", topicId: "id-2" },
      ],
      skipDuplicates: true,
    });
  });

  it("handles empty topic slugs by deleting all existing topics", async () => {
    const tx = createMockTx();
    const mockDeleteMany = tx.collectionTopic.deleteMany as jest.Mock;
    const mockCreateMany = tx.collectionTopic.createMany as jest.Mock;

    const topicIdBySlug = new Map<string, string>();

    await syncCollectionTopics(tx, "collection-id", [], topicIdBySlug);

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        collectionId: "collection-id",
      },
    });

    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("throws error for unknown topic slug", async () => {
    const tx = createMockTx();
    const topicIdBySlug = new Map([["known-topic", "id-1"]]);

    await expect(
      syncCollectionTopics(tx, "collection-id", ["unknown-topic"], topicIdBySlug),
    ).rejects.toThrow("Unknown topic slug referenced by collection: unknown-topic");
  });
});

describe("syncSeriesTopics", () => {
  it("deletes existing topics and creates new ones", async () => {
    const tx = createMockTx();
    const mockDeleteMany = tx.seriesTopic.deleteMany as jest.Mock;
    const mockCreateMany = tx.seriesTopic.createMany as jest.Mock;

    const topicIdBySlug = new Map([
      ["topic-1", "id-1"],
      ["topic-2", "id-2"],
    ]);

    await syncSeriesTopics(tx, "series-id", ["topic-1", "topic-2"], topicIdBySlug);

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        seriesId: "series-id",
        topicId: { notIn: ["id-1", "id-2"] },
      },
    });

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        { seriesId: "series-id", topicId: "id-1" },
        { seriesId: "series-id", topicId: "id-2" },
      ],
      skipDuplicates: true,
    });
  });

  it("handles empty topic slugs", async () => {
    const tx = createMockTx();
    const mockDeleteMany = tx.seriesTopic.deleteMany as jest.Mock;
    const mockCreateMany = tx.seriesTopic.createMany as jest.Mock;

    await syncSeriesTopics(tx, "series-id", [], new Map());

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        seriesId: "series-id",
      },
    });

    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("throws error for unknown topic slug", async () => {
    const tx = createMockTx();
    const topicIdBySlug = new Map([["known-topic", "id-1"]]);

    await expect(
      syncSeriesTopics(tx, "series-id", ["unknown-topic"], topicIdBySlug),
    ).rejects.toThrow("Unknown topic slug referenced by series: unknown-topic");
  });
});

describe("syncLectureTopics", () => {
  it("deletes existing topics and creates new ones", async () => {
    const tx = createMockTx();
    const mockDeleteMany = tx.lectureTopic.deleteMany as jest.Mock;
    const mockCreateMany = tx.lectureTopic.createMany as jest.Mock;

    const topicIdBySlug = new Map([
      ["topic-1", "id-1"],
      ["topic-2", "id-2"],
    ]);

    await syncLectureTopics(tx, "lecture-id", ["topic-1", "topic-2"], topicIdBySlug);

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        lectureId: "lecture-id",
        topicId: { notIn: ["id-1", "id-2"] },
      },
    });

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        { lectureId: "lecture-id", topicId: "id-1" },
        { lectureId: "lecture-id", topicId: "id-2" },
      ],
      skipDuplicates: true,
    });
  });

  it("handles empty topic slugs", async () => {
    const tx = createMockTx();
    const mockDeleteMany = tx.lectureTopic.deleteMany as jest.Mock;
    const mockCreateMany = tx.lectureTopic.createMany as jest.Mock;

    await syncLectureTopics(tx, "lecture-id", [], new Map());

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        lectureId: "lecture-id",
      },
    });

    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("throws error for unknown topic slug", async () => {
    const tx = createMockTx();
    const topicIdBySlug = new Map([["known-topic", "id-1"]]);

    await expect(
      syncLectureTopics(tx, "lecture-id", ["unknown-topic"], topicIdBySlug),
    ).rejects.toThrow("Unknown topic slug referenced by lecture: unknown-topic");
  });
});
