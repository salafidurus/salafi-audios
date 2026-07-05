import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Status } from '@sd/core-db';
import type { Locale, SearchCatalogItemDto } from '@sd/core-contracts';
import { ConfigService } from '../../shared/config/config.service';
import { PrismaService } from '../../shared/db/prisma.service';
import type { SearchQueryDto } from './dto/search-query.dto';
import { isTrigramSearchFailure } from './search-error.utils';
import { resolveContentTranslation } from '../../shared/utils/resolve-content-translation';
import { getRequestLocale } from '../../shared/i18n/locale-context';

const SIMILARITY_THRESHOLD = 0.12;

type SearchRow = SearchCatalogItemDto & { originalLanguage: Locale | null };
type SearchEntity = 'collection' | 'series' | 'lecture';

@Injectable()
export class SearchRepository {
  private readonly logger = new Logger(SearchRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listCollections(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const locale = getRequestLocale();
    const topicSlugs = this.resolveTopicSlugs(query);
    const orderBySql = this.collectionOrderBySql(query.q ?? '', includeRelated);
    const fallbackOrderBySql = this.collectionFallbackOrderBySql(query.q ?? '', includeRelated);
    const rows = await this.runSearchQuery(
      () =>
        this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        c."id",
        c."slug",
        c."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        c."coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        COALESCE(c."publishedLectureCount", 0) AS "lectureCount",
        c."publishedDurationSeconds" AS "durationSeconds",
        c."language" AS "originalLanguage"
      FROM "Listing" c
      JOIN "Scholar" s ON s."id" = c."scholarId"
      WHERE c."format" = 'collection'
        AND c."status" = ${Status.published}
        AND c."deletedAt" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND c."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.collectionMatchSql(query.q ?? '', includeRelated)})
        ${this.collectionTopicFilterSql(topicSlugs)}
      ORDER BY ${orderBySql}
      LIMIT ${take}
    `),
      () =>
        this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        c."id",
        c."slug",
        c."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        c."coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        COALESCE(c."publishedLectureCount", 0) AS "lectureCount",
        c."publishedDurationSeconds" AS "durationSeconds",
        c."language" AS "originalLanguage"
      FROM "Listing" c
      JOIN "Scholar" s ON s."id" = c."scholarId"
      WHERE c."format" = 'collection'
        AND c."status" = ${Status.published}
        AND c."deletedAt" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND c."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.collectionFallbackMatchSql(query.q ?? '', includeRelated)})
        ${this.collectionTopicFilterSql(topicSlugs)}
      ORDER BY ${fallbackOrderBySql}
      LIMIT ${take}
    `),
    );

    return this.resolveSearchRows(
      rows.map((row) => this.normalizeSearchItem(row)),
      'collection',
      locale,
    );
  }

  async listSeries(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const locale = getRequestLocale();
    const topicSlugs = this.resolveTopicSlugs(query);
    const orderBySql = this.seriesOrderBySql(query.q ?? '', includeRelated);
    const fallbackOrderBySql = this.seriesFallbackOrderBySql(query.q ?? '', includeRelated);
    const rows = await this.runSearchQuery(
      () =>
        this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        se."id",
        se."slug",
        se."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        se."coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        COALESCE(se."publishedLectureCount", 0) AS "lectureCount",
        se."publishedDurationSeconds" AS "durationSeconds",
        se."language" AS "originalLanguage"
      FROM "Listing" se
      JOIN "Scholar" s ON s."id" = se."scholarId"
      WHERE se."format" = 'series'
        AND se."status" = ${Status.published}
        AND se."deletedAt" IS NULL
        AND se."parentId" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND se."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.seriesMatchSql(query.q ?? '', includeRelated)})
        ${this.seriesTopicFilterSql(topicSlugs)}
      ORDER BY ${orderBySql}
      LIMIT ${take}
    `),
      () =>
        this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        se."id",
        se."slug",
        se."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        se."coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        COALESCE(se."publishedLectureCount", 0) AS "lectureCount",
        se."publishedDurationSeconds" AS "durationSeconds",
        se."language" AS "originalLanguage"
      FROM "Listing" se
      JOIN "Scholar" s ON s."id" = se."scholarId"
      WHERE se."format" = 'series'
        AND se."status" = ${Status.published}
        AND se."deletedAt" IS NULL
        AND se."parentId" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND se."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.seriesFallbackMatchSql(query.q ?? '', includeRelated)})
        ${this.seriesTopicFilterSql(topicSlugs)}
      ORDER BY ${fallbackOrderBySql}
      LIMIT ${take}
    `),
    );

    return this.resolveSearchRows(
      rows.map((row) => this.normalizeSearchItem(row)),
      'series',
      locale,
    );
  }

  async listSingles(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<SearchCatalogItemDto[]> {
    const locale = getRequestLocale();
    const topicSlugs = this.resolveTopicSlugs(query);
    const orderBySql = this.lectureOrderBySql(query.q ?? '', includeRelated);
    const fallbackOrderBySql = this.lectureFallbackOrderBySql(query.q ?? '', includeRelated);
    const rows = await this.runSearchQuery(
      () =>
        this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        l."id",
        l."slug",
        l."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        NULL AS "coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        1 AS "lectureCount",
        l."durationSeconds" AS "durationSeconds",
        l."language" AS "originalLanguage"
      FROM "Listing" l
      JOIN "Scholar" s ON s."id" = l."scholarId"
      WHERE l."format" = 'single'
        AND l."status" = ${Status.published}
        AND l."deletedAt" IS NULL
        AND l."parentId" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND l."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.lectureMatchSql(query.q ?? '', includeRelated)})
        ${this.lectureTopicFilterSql(topicSlugs)}
      ORDER BY ${orderBySql}
      LIMIT ${take}
    `),
      () =>
        this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      SELECT
        l."id",
        l."slug",
        l."title",
        s."name" AS "scholarName",
        s."slug" AS "scholarSlug",
        NULL AS "coverImageUrl",
        s."imageUrl" AS "scholarImageUrl",
        1 AS "lectureCount",
        l."durationSeconds" AS "durationSeconds",
        l."language" AS "originalLanguage"
      FROM "Listing" l
      JOIN "Scholar" s ON s."id" = l."scholarId"
      WHERE l."format" = 'single'
        AND l."status" = ${Status.published}
        AND l."deletedAt" IS NULL
        AND l."parentId" IS NULL
        AND s."isActive" = true
        ${query.language ? Prisma.sql`AND l."language" = ${query.language}` : Prisma.sql``}
        ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
        AND (${this.lectureFallbackMatchSql(query.q ?? '', includeRelated)})
        ${this.lectureTopicFilterSql(topicSlugs)}
      ORDER BY ${fallbackOrderBySql}
      LIMIT ${take}
    `),
    );

    return this.resolveSearchRows(
      rows.map((row) => this.normalizeSearchItem(row)),
      'lecture',
      locale,
    );
  }

  private async runSearchQuery<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    try {
      return await primary();
    } catch (error) {
      if (!isTrigramSearchFailure(error)) {
        throw error;
      }

      this.logger.warn('Trigram search support is unavailable. Falling back to ILIKE search.');

      return fallback();
    }
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

  private collectionMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
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
            FROM "ListingTopic" ct
            JOIN "Topic" t ON t."id" = ct."topicId"
            WHERE ct."listingId" = c."id"
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
            FROM "ListingTopic" st
            JOIN "Topic" t ON t."id" = st."topicId"
            WHERE st."listingId" = se."id"
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
            FROM "ListingTopic" lt
            JOIN "Topic" t ON t."id" = lt."topicId"
            WHERE lt."listingId" = l."id"
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

  private collectionFallbackMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const pattern = this.likeContainsPattern(query);
    const clauses: Prisma.Sql[] = [
      Prisma.sql`c."title" ILIKE ${pattern} ESCAPE '\\'`,
      Prisma.sql`COALESCE(c."description", '') ILIKE ${pattern} ESCAPE '\\'`,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" ILIKE ${pattern} ESCAPE '\\'`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "ListingTopic" ct
            JOIN "Topic" t ON t."id" = ct."topicId"
            WHERE ct."listingId" = c."id"
              AND (
                t."name" ILIKE ${pattern} ESCAPE '\\'
                OR t."slug" ILIKE ${pattern} ESCAPE '\\'
              )
          )
        `,
      );
    }

    return Prisma.sql`${Prisma.join(clauses, ' OR ')}`;
  }

  private seriesFallbackMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const pattern = this.likeContainsPattern(query);
    const clauses: Prisma.Sql[] = [
      Prisma.sql`se."title" ILIKE ${pattern} ESCAPE '\\'`,
      Prisma.sql`COALESCE(se."description", '') ILIKE ${pattern} ESCAPE '\\'`,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" ILIKE ${pattern} ESCAPE '\\'`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "ListingTopic" st
            JOIN "Topic" t ON t."id" = st."topicId"
            WHERE st."listingId" = se."id"
              AND (
                t."name" ILIKE ${pattern} ESCAPE '\\'
                OR t."slug" ILIKE ${pattern} ESCAPE '\\'
              )
          )
        `,
      );
    }

    return Prisma.sql`${Prisma.join(clauses, ' OR ')}`;
  }

  private lectureFallbackMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const pattern = this.likeContainsPattern(query);
    const clauses: Prisma.Sql[] = [
      Prisma.sql`l."title" ILIKE ${pattern} ESCAPE '\\'`,
      Prisma.sql`COALESCE(l."description", '') ILIKE ${pattern} ESCAPE '\\'`,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" ILIKE ${pattern} ESCAPE '\\'`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "ListingTopic" lt
            JOIN "Topic" t ON t."id" = lt."topicId"
            WHERE lt."listingId" = l."id"
              AND (
                t."name" ILIKE ${pattern} ESCAPE '\\'
                OR t."slug" ILIKE ${pattern} ESCAPE '\\'
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
        FROM "ListingTopic" ct
        JOIN "Topic" t ON t."id" = ct."topicId"
        WHERE ct."listingId" = c."id"
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
        FROM "ListingTopic" st
        JOIN "Topic" t ON t."id" = st."topicId"
        WHERE st."listingId" = se."id"
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
        FROM "ListingTopic" lt
        JOIN "Topic" t ON t."id" = lt."topicId"
        WHERE lt."listingId" = l."id"
          AND t."slug" = ${slug}
      )
    `,
    );

    return Prisma.sql`
      AND (${Prisma.join(clauses, ' OR ')})
    `;
  }

  private collectionFallbackOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const clauses = this.fallbackRankingClauses('c."title"', 's."name"', query, includeRelated);

    clauses.push(Prisma.sql`c."publishedLectureCount" DESC NULLS LAST`, Prisma.sql`c."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private seriesFallbackOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const clauses = this.fallbackRankingClauses('se."title"', 's."name"', query, includeRelated);

    clauses.push(Prisma.sql`se."publishedLectureCount" DESC NULLS LAST`, Prisma.sql`se."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private lectureFallbackOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const clauses = this.fallbackRankingClauses('l."title"', 's."name"', query, includeRelated);

    clauses.push(Prisma.sql`l."publishedAt" DESC NULLS LAST`, Prisma.sql`l."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private collectionOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [Prisma.sql`similarity(c."title", ${queryText}) DESC`];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(Prisma.sql`similarity(COALESCE(c."description", ''), ${queryText}) DESC`);

    if (includeRelated) {
      clauses.push(
        Prisma.sql`
          COALESCE((
            SELECT MAX(GREATEST(
              similarity(t."name", ${queryText}),
              similarity(t."slug", ${queryText})
            ))
            FROM "ListingTopic" ct
            JOIN "Topic" t ON t."id" = ct."topicId"
            WHERE ct."listingId" = c."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(Prisma.sql`c."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private seriesOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [Prisma.sql`similarity(se."title", ${queryText}) DESC`];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(Prisma.sql`similarity(COALESCE(se."description", ''), ${queryText}) DESC`);

    if (includeRelated) {
      clauses.push(
        Prisma.sql`
          COALESCE((
            SELECT MAX(GREATEST(
              similarity(t."name", ${queryText}),
              similarity(t."slug", ${queryText})
            ))
            FROM "ListingTopic" st
            JOIN "Topic" t ON t."id" = st."topicId"
            WHERE st."listingId" = se."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(Prisma.sql`se."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private lectureOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [Prisma.sql`similarity(l."title", ${queryText}) DESC`];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(Prisma.sql`similarity(COALESCE(l."description", ''), ${queryText}) DESC`);

    if (includeRelated) {
      clauses.push(
        Prisma.sql`
          COALESCE((
            SELECT MAX(GREATEST(
              similarity(t."name", ${queryText}),
              similarity(t."slug", ${queryText})
            ))
            FROM "ListingTopic" lt
            JOIN "Topic" t ON t."id" = lt."topicId"
            WHERE lt."listingId" = l."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(Prisma.sql`l."publishedAt" DESC NULLS LAST`, Prisma.sql`l."id" ASC`);

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private fallbackRankingClauses(
    titleColumn: string,
    scholarColumn: string,
    query: string,
    includeRelated: boolean,
  ): Prisma.Sql[] {
    const exact = this.likeExactPattern(query);
    const prefix = this.likePrefixPattern(query);
    const contains = this.likeContainsPattern(query);
    const scholarCases = includeRelated
      ? Prisma.sql`
          WHEN ${Prisma.raw(scholarColumn)} ILIKE ${exact} ESCAPE '\\' THEN 3
          WHEN ${Prisma.raw(scholarColumn)} ILIKE ${prefix} ESCAPE '\\' THEN 4
          WHEN ${Prisma.raw(scholarColumn)} ILIKE ${contains} ESCAPE '\\' THEN 5
        `
      : Prisma.sql``;

    return [
      Prisma.sql`
        CASE
          WHEN ${Prisma.raw(titleColumn)} ILIKE ${exact} ESCAPE '\\' THEN 0
          WHEN ${Prisma.raw(titleColumn)} ILIKE ${prefix} ESCAPE '\\' THEN 1
          WHEN ${Prisma.raw(titleColumn)} ILIKE ${contains} ESCAPE '\\' THEN 2
          ${scholarCases}
          ELSE 6
        END ASC
      `,
    ];
  }

  private likeExactPattern(query: string): string {
    return this.escapeLikePattern(query);
  }

  private likePrefixPattern(query: string): string {
    return `${this.escapeLikePattern(query)}%`;
  }

  private likeContainsPattern(query: string): string {
    return `%${this.escapeLikePattern(query)}%`;
  }

  private escapeLikePattern(query: string): string {
    return query.replace(/[\\%_]/g, '\\$&');
  }

  private normalizeSearchItem<T extends SearchCatalogItemDto>(item: T): T {
    return {
      ...item,
      coverImageUrl: this.toOptionalPublicUrl(item.coverImageUrl),
      scholarImageUrl: this.toOptionalPublicUrl(item.scholarImageUrl),
    };
  }

  /**
   * Overlays published target-locale title translations onto raw search rows,
   * keeping the original title available via the `original` block for clients
   * that prefer original-language content.
   */
  private async resolveSearchRows(
    rows: SearchRow[],
    entity: SearchEntity,
    locale: Locale,
  ): Promise<SearchCatalogItemDto[]> {
    const ids = rows.map((row) => row.id);
    const translations = await this.fetchTitleTranslations(entity, ids, locale);

    return rows.map((row) => {
      const { originalLanguage, ...item } = row;
      const resolved = resolveContentTranslation({
        base: { title: item.title },
        originalLanguage,
        targetLocale: locale,
        publishedTranslation: translations.get(row.id) ?? null,
      });
      return {
        ...item,
        title: resolved.fields.title,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      };
    });
  }

  private async fetchTitleTranslations(
    entity: SearchEntity,
    ids: string[],
    locale: Locale,
  ): Promise<Map<string, { title: string }>> {
    const map = new Map<string, { title: string }>();
    if (!ids.length) return map;

    const rows = await this.prisma.listingTranslation.findMany({
      where: { listingId: { in: ids }, locale, status: 'published' },
      select: { listingId: true, title: true },
    });
    for (const r of rows) map.set(r.listingId, { title: r.title });

    return map;
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
