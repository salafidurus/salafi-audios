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

@Injectable()
export class SearchRepository {
  private readonly logger = new Logger(SearchRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async searchListings(
    query: SearchQueryDto,
    take: number,
    includeRelated: boolean,
  ): Promise<{
    collections: SearchCatalogItemDto[];
    series: SearchCatalogItemDto[];
    singles: SearchCatalogItemDto[];
  }> {
    const locale = getRequestLocale();
    const topicSlugs = this.resolveTopicSlugs(query);
    const matchSql = this.matchSql(query.q ?? '', includeRelated);
    const fallbackMatchSql = this.fallbackMatchSql(query.q ?? '', includeRelated);
    const orderBySql = this.orderBySql(query.q ?? '', includeRelated);
    const fallbackOrderBySql = this.fallbackOrderBySql(query.q ?? '', includeRelated);
    const topicFilterSql = this.topicFilterSql(topicSlugs);

    // Fetch all results (collections, series, singles) in one query using window function partitioning
    const rows = await this.runSearchQuery(
      () =>
        this.prisma.$queryRaw<(SearchRow & { format: string })[]>(Prisma.sql`
        WITH ranked AS (
          SELECT
            lst."id",
            lst."slug",
            lst."title",
            lst."format",
            s."name" AS "scholarName",
            s."slug" AS "scholarSlug",
            CASE WHEN lst."format" = 'single' THEN NULL ELSE lst."coverImageUrl" END AS "coverImageUrl",
            s."imageUrl" AS "scholarImageUrl",
            CASE WHEN lst."format" = 'single' THEN 1 ELSE COALESCE(lst."publishedLectureCount", 0) END AS "lectureCount",
            CASE WHEN lst."format" = 'single' THEN lst."durationSeconds" ELSE lst."publishedDurationSeconds" END AS "durationSeconds",
            lst."language" AS "originalLanguage",
            ROW_NUMBER() OVER (
              PARTITION BY lst."format"
              ORDER BY ${orderBySql}
            ) AS rn
          FROM "Listing" lst
          JOIN "Scholar" s ON s."id" = lst."scholarId"
          WHERE lst."status" = ${Status.published}
            AND lst."deletedAt" IS NULL
            AND lst."parentId" IS NULL
            AND s."isActive" = true
            ${query.language ? Prisma.sql`AND lst."language" = ${query.language}` : Prisma.sql``}
            ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
            AND (${matchSql})
            ${topicFilterSql}
        )
        SELECT * FROM ranked WHERE rn <= ${take} ORDER BY "format", rn
      `),
      () =>
        this.prisma.$queryRaw<(SearchRow & { format: string })[]>(Prisma.sql`
        WITH ranked AS (
          SELECT
            lst."id",
            lst."slug",
            lst."title",
            lst."format",
            s."name" AS "scholarName",
            s."slug" AS "scholarSlug",
            CASE WHEN lst."format" = 'single' THEN NULL ELSE lst."coverImageUrl" END AS "coverImageUrl",
            s."imageUrl" AS "scholarImageUrl",
            CASE WHEN lst."format" = 'single' THEN 1 ELSE COALESCE(lst."publishedLectureCount", 0) END AS "lectureCount",
            CASE WHEN lst."format" = 'single' THEN lst."durationSeconds" ELSE lst."publishedDurationSeconds" END AS "durationSeconds",
            lst."language" AS "originalLanguage",
            ROW_NUMBER() OVER (
              PARTITION BY lst."format"
              ORDER BY ${fallbackOrderBySql}
            ) AS rn
          FROM "Listing" lst
          JOIN "Scholar" s ON s."id" = lst."scholarId"
          WHERE lst."status" = ${Status.published}
            AND lst."deletedAt" IS NULL
            AND lst."parentId" IS NULL
            AND s."isActive" = true
            ${query.language ? Prisma.sql`AND lst."language" = ${query.language}` : Prisma.sql``}
            ${query.scholarSlug ? Prisma.sql`AND s."slug" = ${query.scholarSlug}` : Prisma.sql``}
            AND (${fallbackMatchSql})
            ${topicFilterSql}
        )
        SELECT * FROM ranked WHERE rn <= ${take} ORDER BY "format", rn
      `),
    );

    // Batch fetch all translations at once (no per-format loop)
    const ids = rows.map((row) => row.id);
    const translations = await this.fetchTitleTranslations(ids, locale);

    // Partition results by format and resolve translations
    const collections: SearchCatalogItemDto[] = [];
    const series: SearchCatalogItemDto[] = [];
    const singles: SearchCatalogItemDto[] = [];

    for (const row of rows) {
      const { format, originalLanguage, ...item } = row;
      const resolved = resolveContentTranslation({
        base: { title: item.title },
        originalLanguage,
        targetLocale: locale,
        publishedTranslation: translations.get(row.id) ?? null,
      });
      const normalized = this.normalizeSearchItem({
        ...item,
        title: resolved.fields.title,
        originalLanguage: resolved.originalLanguage,
        original: resolved.original ? { title: resolved.original.title } : undefined,
      });

      if (format === 'collection') {
        collections.push(normalized);
      } else if (format === 'series') {
        series.push(normalized);
      } else if (format === 'single') {
        singles.push(normalized);
      }
    }

    return { collections, series, singles };
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

  private matchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [
      Prisma.sql`lst."title" % ${queryText}`,
      Prisma.sql`similarity(lst."title", ${queryText}) > ${SIMILARITY_THRESHOLD}`,
      Prisma.sql`COALESCE(lst."description", '') % ${queryText}`,
      Prisma.sql`
        similarity(COALESCE(lst."description", ''), ${queryText}) > ${SIMILARITY_THRESHOLD}
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
            WHERE lt."listingId" = lst."id"
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

  private fallbackMatchSql(query: string, includeRelated: boolean): Prisma.Sql {
    const pattern = this.likeContainsPattern(query);
    const clauses: Prisma.Sql[] = [
      Prisma.sql`lst."title" ILIKE ${pattern} ESCAPE '\\'`,
      Prisma.sql`COALESCE(lst."description", '') ILIKE ${pattern} ESCAPE '\\'`,
    ];

    if (includeRelated) {
      clauses.push(
        Prisma.sql`s."name" ILIKE ${pattern} ESCAPE '\\'`,
        Prisma.sql`
          EXISTS (
            SELECT 1
            FROM "ListingTopic" lt
            JOIN "Topic" t ON t."id" = lt."topicId"
            WHERE lt."listingId" = lst."id"
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

  private topicFilterSql(topicSlugs: string[]): Prisma.Sql {
    if (!topicSlugs.length) return Prisma.sql``;

    const clauses = topicSlugs.map(
      (slug) => Prisma.sql`
      EXISTS (
        SELECT 1
        FROM "ListingTopic" lt
        JOIN "Topic" t ON t."id" = lt."topicId"
        WHERE lt."listingId" = lst."id"
          AND t."slug" = ${slug}
      )
    `,
    );

    return Prisma.sql`
      AND (${Prisma.join(clauses, ' OR ')})
    `;
  }

  private fallbackOrderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const clauses = this.fallbackRankingClauses(query, includeRelated);

    clauses.push(
      Prisma.sql`CASE WHEN lst."format" != 'single' THEN lst."publishedLectureCount" END DESC NULLS LAST`,
      Prisma.sql`CASE WHEN lst."format" = 'single' THEN lst."publishedAt" END DESC NULLS LAST`,
      Prisma.sql`lst."id" ASC`,
    );

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private orderBySql(query: string, includeRelated: boolean): Prisma.Sql {
    const queryText = Prisma.sql`CAST(${query} AS TEXT)`;
    const clauses: Prisma.Sql[] = [Prisma.sql`similarity(lst."title", ${queryText}) DESC`];

    if (includeRelated) {
      clauses.push(Prisma.sql`similarity(s."name", ${queryText}) DESC`);
    }

    clauses.push(Prisma.sql`similarity(COALESCE(lst."description", ''), ${queryText}) DESC`);

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
            WHERE lt."listingId" = lst."id"
          ), 0) DESC
        `,
      );
    }

    clauses.push(
      Prisma.sql`CASE WHEN lst."format" = 'single' THEN lst."publishedAt" END DESC NULLS LAST`,
      Prisma.sql`lst."id" ASC`,
    );

    return Prisma.sql`${Prisma.join(clauses, ', ')}`;
  }

  private fallbackRankingClauses(query: string, includeRelated: boolean): Prisma.Sql[] {
    const exact = this.likeExactPattern(query);
    const prefix = this.likePrefixPattern(query);
    const contains = this.likeContainsPattern(query);
    const scholarCases = includeRelated
      ? Prisma.sql`
          WHEN s."name" ILIKE ${exact} ESCAPE '\\' THEN 3
          WHEN s."name" ILIKE ${prefix} ESCAPE '\\' THEN 4
          WHEN s."name" ILIKE ${contains} ESCAPE '\\' THEN 5
        `
      : Prisma.sql``;

    return [
      Prisma.sql`
        CASE
          WHEN lst."title" ILIKE ${exact} ESCAPE '\\' THEN 0
          WHEN lst."title" ILIKE ${prefix} ESCAPE '\\' THEN 1
          WHEN lst."title" ILIKE ${contains} ESCAPE '\\' THEN 2
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

  private async fetchTitleTranslations(
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
