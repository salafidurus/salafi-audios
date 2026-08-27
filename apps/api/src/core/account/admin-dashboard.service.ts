import { ForbiddenException, Injectable } from '@nestjs/common';
import type { AdminDashboardDto } from '@sd/core-contracts';

import { PrismaService } from '../db/prisma.service';
import { defineAbilityFor } from '../auth/ability/ability.factory';
import { accessibleScopeIds } from '../auth/ability/accessible-scope';
import type {
  AbilityInput,
  AppAbility,
  AppActions,
  AppSubjectType,
} from '../auth/ability/ability.types';

type DashboardUser = AbilityInput & { id: string };

const CONTENT_ACTIONS: AppActions[] = ['read', 'write', 'publish', 'delete'];

function buildDashboardMetrics(values: {
  scholars: number | undefined;
  listings: number | undefined;
  topics: number | undefined;
  users: number | undefined;
}): AdminDashboardDto['metrics'] {
  const metrics: AdminDashboardDto['metrics'] = {};
  if (values.scholars !== undefined) metrics.scholars = values.scholars;
  if (values.listings !== undefined) metrics.listings = values.listings;
  if (values.topics !== undefined) metrics.topics = values.topics;
  if (values.users !== undefined) metrics.users = values.users;
  return metrics;
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: DashboardUser): Promise<AdminDashboardDto> {
    const ability = defineAbilityFor(user);
    const access = this.dashboardAccess(ability);
    this.assertDashboardAccess(access);
    return this.loadDashboard(access);
  }

  private dashboardAccess(ability: AppAbility) {
    const scholarScope = this.scopeFor(ability, 'Scholar', 'slug');
    const listingScope = this.scopeFor(ability, 'Listing', 'scholarSlug');
    return {
      scholarScope,
      listingScope,
      canSeeScholars: scholarScope !== null,
      canSeeListings: listingScope !== null,
      canSeeTopics: this.hasAnyCapability(ability, 'Topic'),
      canSeeUsers: ability.can('manage', 'UserAccess'),
    };
  }

  private assertDashboardAccess(access: ReturnType<AdminDashboardService['dashboardAccess']>) {
    if (
      !access.canSeeScholars &&
      !access.canSeeListings &&
      !access.canSeeTopics &&
      !access.canSeeUsers
    ) {
      throw new ForbiddenException('Missing admin dashboard access');
    }
  }

  private async loadDashboard(access: ReturnType<AdminDashboardService['dashboardAccess']>) {
    const scholarWhere = this.scholarWhere(access.scholarScope);
    const listingWhere = {
      deletedAt: null,
      scholar: access.listingScope ? { slug: { in: access.listingScope } } : undefined,
    };
    const [scholars, listings, topics, users, activity, pendingWork] = await Promise.all([
      access.canSeeScholars ? this.prisma.scholar.count({ where: scholarWhere }) : undefined,
      access.canSeeListings ? this.prisma.listing.count({ where: listingWhere }) : undefined,
      access.canSeeTopics ? this.prisma.topic.count() : undefined,
      access.canSeeUsers ? this.prisma.user.count() : undefined,
      this.getActivity({ scholarScope: access.scholarScope, listingScope: access.listingScope }),
      this.getPendingWork(access.listingScope),
    ]);
    return {
      metrics: buildDashboardMetrics({ scholars, listings, topics, users }),
      activity,
      pendingWork,
    };
  }

  private hasAnyCapability(ability: AppAbility, subject: AppSubjectType): boolean {
    return CONTENT_ACTIONS.some((action) =>
      ability.rulesFor(action, subject).some((rule) => !rule.inverted),
    );
  }

  /** `undefined` is global access, `[]` is no scoped access, and `null` means no capability. */
  private scopeFor(
    ability: AppAbility,
    subject: AppSubjectType,
    conditionKey: 'slug' | 'scholarSlug',
  ): string[] | undefined | null {
    const scopes = CONTENT_ACTIONS.map((action) => {
      const rules = ability.rulesFor(action, subject);
      return rules.some((rule) => !rule.inverted)
        ? accessibleScopeIds(ability, action, subject, conditionKey)
        : null;
    }).filter((scope): scope is string[] | undefined => scope !== null);

    if (scopes.length === 0) return null;
    if (scopes.some((scope) => scope === undefined)) return undefined;
    const scoped = scopes.filter((scope): scope is string[] => scope !== undefined);
    return [...new Set(scoped.flat())];
  }

  private async getActivity({
    scholarScope,
    listingScope,
  }: {
    scholarScope: string[] | undefined | null;
    listingScope: string[] | undefined | null;
  }): Promise<AdminDashboardDto['activity']> {
    const [scholars, listings] = await Promise.all([
      scholarScope === null
        ? []
        : this.prisma.scholar.findMany({
            where: this.scholarWhere(scholarScope),
            orderBy: { updatedAt: 'desc' },
            take: 8,
            select: { id: true, name: true, createdAt: true, updatedAt: true },
          }),
      listingScope === null
        ? []
        : this.prisma.listing.findMany({
            where: this.listingWhere(listingScope),
            orderBy: { updatedAt: 'desc' },
            take: 8,
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              scholar: { select: { name: true } },
            },
          }),
    ]);

    return [
      ...scholars.map((scholar) => ({
        id: scholar.id,
        type: 'scholar' as const,
        title: scholar.name,
        occurredAt: (scholar.updatedAt ?? scholar.createdAt).toISOString(),
        href: `/admin/scholars?scholar=${scholar.id}`,
      })),
      ...listings.map((listing) => ({
        id: listing.id,
        type: 'listing' as const,
        title: listing.title,
        subtitle: listing.scholar.name,
        status: listing.status,
        occurredAt: (listing.updatedAt ?? listing.createdAt).toISOString(),
        href: `/admin/contents?listing=${listing.id}`,
      })),
    ]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 8);
  }

  private async getPendingWork(
    listingScope: string[] | undefined | null,
  ): Promise<AdminDashboardDto['pendingWork']> {
    if (listingScope === null) return [];

    const listings = await this.prisma.listing.findMany({
      where: { ...this.listingWhere(listingScope), status: { in: ['draft', 'review'] } },
      orderBy: { updatedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        scholar: { select: { name: true } },
      },
    });

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      scholarName: listing.scholar.name,
      // SAFETY: the Prisma query restricts status to the two pending values above.
      status: listing.status as 'draft' | 'review',
      updatedAt: (listing.updatedAt ?? listing.createdAt).toISOString(),
      href: `/admin/contents?listing=${listing.id}`,
    }));
  }

  private scholarWhere(scholarScope: string[] | undefined | null) {
    return {
      slug: scholarScope === undefined || scholarScope === null ? undefined : { in: scholarScope },
    };
  }

  private listingWhere(listingScope: string[] | undefined | null) {
    return {
      deletedAt: null,
      scholar:
        listingScope === undefined || listingScope === null
          ? undefined
          : { slug: { in: listingScope } },
    };
  }
}
