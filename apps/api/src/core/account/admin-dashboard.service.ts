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

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: DashboardUser): Promise<AdminDashboardDto> {
    const ability = defineAbilityFor(user);
    const scholarScope = this.scopeFor(ability, 'Scholar', 'slug');
    const listingScope = this.scopeFor(ability, 'Listing', 'scholarSlug');
    const canSeeScholars = scholarScope !== null;
    const canSeeListings = listingScope !== null;
    const canSeeTopics = this.hasAnyCapability(ability, 'Topic');
    const canSeeUsers = ability.can('manage', 'UserAccess');

    if (!canSeeScholars && !canSeeListings && !canSeeTopics && !canSeeUsers) {
      throw new ForbiddenException('Missing admin dashboard access');
    }

    const scholarWhere = this.scholarWhere(scholarScope);
    const listingWhere = {
      deletedAt: null,
      scholar:
        listingScope === undefined || listingScope === null
          ? undefined
          : { slug: { in: listingScope } },
    };

    const [scholars, listings, topics, users, activity, pendingWork] = await Promise.all([
      canSeeScholars ? this.prisma.scholar.count({ where: scholarWhere }) : undefined,
      canSeeListings ? this.prisma.listing.count({ where: listingWhere }) : undefined,
      canSeeTopics ? this.prisma.topic.count() : undefined,
      canSeeUsers ? this.prisma.user.count() : undefined,
      this.getActivity({ scholarScope, listingScope }),
      this.getPendingWork(listingScope),
    ]);

    const metrics: AdminDashboardDto['metrics'] = {};
    if (scholars !== undefined) metrics.scholars = scholars;
    if (listings !== undefined) metrics.listings = listings;
    if (topics !== undefined) metrics.topics = topics;
    if (users !== undefined) metrics.users = users;

    return {
      metrics,
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
