import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@sd/db';
import type { SearchCatalogItemDto } from '@sd/contracts';
import { ConfigService } from '@/shared/config/config.service';
import { PrismaService } from '@/shared/db/prisma.service';
import type { SearchQueryDto } from './dto/search-query.dto';

const SIMILARITY_THRESHOLD = 0.12;

@Injectable()
export class SearchRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listCollections(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const topicSlugs = this.resolveTopicSlugs(query);
    const orderBySql = this.collectionOrderBySql(query.q ?? '', includeRelated);
    const rows = await this.prisma.$queryRaw<SearchCatalogItemDto[]>(Prisma.sql`
      SELECT
        c."id",
        c."slug",
        c."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        c."coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        COALESCE(c."publishedLectureCount", 0) AS "lectureCount",
        c."publishedDurationSeconds" AS "durationSeconds"
      FROM "Collection" c
      JOIN "Scholar" s ON s."id" = c."scholarId"
      WHERE c."status" = ${Status.published}
        AND c."deletedAt" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND c."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.collectionMatchSql(query.q ?? '', includeRelated)})
        ${this.collectionTopicFilterSql(topicSlugs)}
      ORDER BY ${orderBySql}
      LIMIT ${take}
    `);

    return rows.map((row) => this.normalizeSearchItem(row));
  }

  async listRootSeries(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const topicSlugs = this.resolveTopicSlugs(query);
    const orderBySql = this.seriesOrderBySql(query.q ?? '', includeRelated);
    const rows = await this.prisma.$queryRaw<SearchCatalogItemDto[]>(Prisma.sql`
      SELECT
        se."id",
        se."slug",
        se."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        se."coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        COALESCE(se."publishedLectureCount", 0) AS "lectureCount",
        se."publishedDurationSeconds" AS "durationSeconds"
      FROM "Series" se
      JOIN "Scholar" s ON s."id" = se."scholarId"
      WHERE se."status" = ${Status.published}
        AND se."deletedAt" IS NULL
        AND se."collectionId" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND se."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.seriesMatchSql(query.q ?? '', includeRelated)})
        ${this.seriesTopicFilterSql(topicSlugs)}
      ORDER BY ${orderBySql}
      LIMIT ${take}
    `);

    return rows.map((row) => this.normalizeSearchItem(row));
  }

  async listRootLectures(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const topicSlugs = this.resolveTopicSlugs(query);
    const orderBySql = this.lectureOrderBySql(query.q ?? '', includeRelated);
    const rows = await this.prisma.$queryRaw<SearchCatalogItemDto[]>(Prisma.sql`
      SELECT
        l."id",
        l."slug",
        l."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        NULL AS "coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        1 AS "lectureCount",
        l."durationSeconds" AS "durationSeconds"
      FROM "Lecture" l
      JOIN "Scholar" s ON s."id" = l."scholarId"
      WHERE l."status" = ${Status.published}
        AND l."deletedAt" IS NULL
        AND l."seriesId" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND l."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.lectureMatchSql(query.q ?? '', includeRelated)})
        ${this.lectureTopicFilterSql(topicSlugs)}
      ORDER BY ${orderBySql}
      LIMIT ${take}
    `);

    return rows.map((row) => this.normalizeSearchItem(row));
  }

  private resolveTopicSlugs(query: SearchQueryDto): string[] {
    if (query.topicSlugs && query.topicSlugs.length) {
      return query.topicSlugs;
    }

    if (query.topicSlug) {
      return [query.topicSlug];
    }

    return [];
  }

  private collectionMatchSql(
    query: string,
    includeRelated: boolean,
  ): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`c."title" % ${queryText}`,
      Prisma.sql`similarity(c."title", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
      Prisma.sql`COALESCE(c."description", '') % ${queryText}`,
      Prisma.sql`
        similarity(COALESCE(c."description", ''), ${queryText}) > ${SIMILARITY_THRESHOLD}
      `,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" % ${queryText}`,
        Prisma.sql`similarity(s."name", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "CollectionTopic" ct
            JOIN "Topic" t ON t."id" = ct."topicId"
            WHERE ct."collectionId" = c."id"
              AND (
                t."name" % ${queryText}
                OR similarity(t."name", ${queryText}) > ${SIMILARITY_THRESHOLD}
                OR t."slug" % ${queryText}
                OR similarity(t."slug", ${queryText}) > ${SIMILARITY_THRESHOLD}
              )
          )
        `,
      );
    }

    return Prisma.sql`${Prisma.join(clauses, ' OR ')}`;
  }

  private seriesMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`se."title" % ${queryText}`,
      Prisma.sql`similarity(se."title", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
      Prisma.sql`COALESCE(se."description", '') % ${queryText}`,
      Prisma.sql`
        similarity(COALESCE(se."description", ''), ${queryText}) > ${SIMILARITY_THRESHOLD}
      `,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" % ${queryText}`,
        Prisma.sql`similarity(s."name", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "SeriesTopic" st
            JOIN "Topic" t ON t."id" = st."topicId"
            WHERE st."seriesId" = se."id"
              AND (
                t."name" % ${queryText}
                OR similarity(t."name", ${queryText}) > ${SIMILARITY_THRESHOLD}
                OR t."slug" % ${queryText}
                OR similarity(t."slug", ${queryText}) > ${SIMILARITY_THRESHOLD}
              )
          )
        `,
      );
    }

    return Prisma.sql`${Prisma.join(clauses, ' OR ')}`;
  }

  private lectureMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`l."title" % ${queryText}`,
      Prisma.sql`similarity(l."title", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
      Prisma.sql`COALESCE(l."description", '') % ${queryText}`,
      Prisma.sql`
        similarity(COALESCE(l."description", ''), ${queryText}) > ${SIMILARITY_THRESHOLD}
      `,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" % ${queryText}`,
        Prisma.sql`similarity(s."name", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "LectureTopic" lt
            JOIN "Topic" t ON t."id" = lt."topicId"
            WHERE lt."lectureId" = l."id"
              AND (
                t."name" % ${queryText}
                OR similarity(t."name", ${queryText}) > ${SIMILARITY_THRESHOLD}
                OR t."slug" % ${queryText}
                OR similarity(t."slug", ${queryText}) > ${SIMILARITY_THRESHOLD}
              )
          )
        `,
      );
    }

    return Prisma.sql`${Prisma.join(clauses, ' OR ')}`;
  }

  private collectionTopicFilterSql(topicSlugs: string[]): Prisma.Sql {
    if (!topicSlugs.length) return Prisma.sql``;

    const clauses = topicSlugs.map(
      (slug) => Prisma.sql`
      EXISTS (
        SELECT 1
        FROM "CollectionTopic" ct
        JOIN "Topic" t ON t."id" = ct."topicId"
        WHERE ct."collectionId" = c."id"
          AND t."slug" = ${slug}
      )
    `,
    );

    return Prisma.sql`
      AND (${Prisma.join(clauses, ' OR ')})
    `;
  }

  private seriesTopicFilterSql(topicSlugs: string[]): Prisma.Sql {
    if (!topicSlugs.length) return Prisma.sql``;

    const clauses = topicSlugs.map(
      (slug) => Prisma.sql`
      EXISTS (
        SELECT 1
        FROM "SeriesTopic" st
        JOIN "Topic" t ON t."id" = st."topicId"
        WHERE st."seriesId" = se."id"
          AND t."slug" = ${slug}
      )
    `,
    );

    return Prisma.sql`
      AND (${Prisma.join(clauses, ' OR ')})
    `;
  }

  private lectureTopicFilterSql(topicSlugs: string[]): Prisma.Sql {
    if (!topicSlugs.length) return Prisma.sql``;

    const clauses = topicSlugs.map(
      (slug) => Prisma.sql`
      EXISTS (
        SELECT 1
        FROM "LectureTopic" lt
        JOIN "Topic" t ON t."id" = lt."topicId"
        WHERE lt."lectureId" = l."id"
          AND t."slug" = ${slug}
      )
    `,
    );

    return Prisma.sql`
      AND (${Prisma.join(clauses, ' OR ')})
    `;
  }

  private collectionOrderBySql(
    query: string,
    includeRelated: boolean,
  ): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`similarity(c."title", ${queryText}) DESC`,
    ];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(
      Prisma.sql`similarity(COALESCE(c."description", ''), ${queryText}) DESC`,
    );

    if (includeRelated) {
      clauses.push(
        Prisma.sql`
          COALESCE((
            SELECT MAX(GREATEST(
              similarity(t."name", ${queryText}),
              similarity(t."slug", ${queryText})
            ))
            FROM "CollectionTopic" ct
            JOIN "Topic" t ON t."id" = ct."topicId"
            WHERE ct."collectionId" = c."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(Prisma.sql`c."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private seriesOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`similarity(se."title", ${queryText}) DESC`,
    ];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(
      Prisma.sql`similarity(COALESCE(se."description", ''), ${queryText}) DESC`,
    );

    if (includeRelated) {
      clauses.push(
        Prisma.sql`
          COALESCE((
            SELECT MAX(GREATEST(
              similarity(t."name", ${queryText}),
              similarity(t."slug", ${queryText})
            ))
            FROM "SeriesTopic" st
            JOIN "Topic" t ON t."id" = st."topicId"
            WHERE st."seriesId" = se."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(Prisma.sql`se."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private lectureOrderBySql(
    query: string,
    includeRelated: boolean,
  ): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`similarity(l."title", ${queryText}) DESC`,
    ];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(
      Prisma.sql`similarity(COALESCE(l."description", ''), ${queryText}) DESC`,
    );

    if (includeRelated) {
      clauses.push(
        Prisma.sql`
          COALESCE((
            SELECT MAX(GREATEST(
              similarity(t."name", ${queryText}),
              similarity(t."slug", ${queryText})
            ))
            FROM "LectureTopic" lt
            JOIN "Topic" t ON t."id" = lt."topicId"
            WHERE lt."lectureId" = l."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(
      Prisma.sql`l."publishedAt" DESC NULLS LAST`,
      Prisma.sql`l."id" ASC`,
    );

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private normalizeSearchItem(
    item: SearchCatalogItemDto,
  ): SearchCatalogItemDto {
    return {
      ...item,
      coverImageUrl: this.toOptionalPublicUrl(item.coverImageUrl),
      scholarImageUrl: this.toOptionalPublicUrl(item.scholarImageUrl),
    };
  }

  private toPublicUrl(value: string): string {
    if (/^[a-z]+:\/\//i.test(value)) {
      return value;
    }

    const base = this.config.ASSET_CDN_BASE_URL;
    if (!base) {
      return value;
    }

    return `${base.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  }

  private toOptionalPublicUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    return this.toPublicUrl(value);
  }
}
