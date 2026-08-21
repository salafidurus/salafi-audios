import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PolicyGuard } from './policy.guard';
import type { CheckPolicyMetadata } from './decorators/check-policy.decorator';

function mockContext(options: {
  metadata?: CheckPolicyMetadata;
  user?: Record<string, unknown>;
  params?: Record<string, string>;
  body?: unknown;
  query?: Record<string, unknown>;
}): ExecutionContext {
  const request = {
    user: options.user,
    params: options.params ?? {},
    body: options.body,
    query: options.query ?? {},
  };
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function baseUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    roles: [],
    ...overrides,
  };
}

describe('PolicyGuard', () => {
  let guard: PolicyGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PolicyGuard(reflector, {} as any);
  });

  it('passes through routes with no @CheckPolicy metadata', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = mockContext({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws when there is no authenticated user', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'read',
      subjectType: 'Scholar',
    });
    const ctx = mockContext({ user: undefined });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('allows superadmin regardless of the required policy', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'delete',
      subjectType: 'Scholar',
    });
    const ctx = mockContext({ user: baseUser({ roles: ['superadmin'] }) });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('allows an unconditioned aggregate capability grant', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'write',
      subjectType: 'Scholar',
    });
    const ctx = mockContext({
      user: baseUser({
        accessGrants: [{ target: 'scholar', capability: 'write', scholarSlug: null, locale: null }],
      }),
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('denies when the user lacks the required global access', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'write',
      subjectType: 'Scholar',
    });
    const ctx = mockContext({ user: baseUser({ accessGrants: [] }) });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('allows a scoped editor to act on their linked scholar via a resolver', async () => {
    const resolve = vi.fn().mockReturnValue({ scholarSlug: 'scholar-a' });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'write',
      subjectType: 'Listing',
      resolve,
    });
    const ctx = mockContext({
      user: baseUser({
        accessGrants: [
          { target: 'listing', capability: 'write', scholarSlug: 'scholar-a', locale: null },
        ],
      }),
      params: { id: 'listing-1' },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(resolve).toHaveBeenCalled();
  });

  it('denies a scoped editor acting on a different scholar via a resolver', async () => {
    const resolve = vi.fn().mockReturnValue({ scholarSlug: 'scholar-b' });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'write',
      subjectType: 'Listing',
      resolve,
    });
    const ctx = mockContext({
      user: baseUser({
        accessGrants: [
          { target: 'listing', capability: 'write', scholarSlug: 'scholar-a', locale: null },
        ],
      }),
      params: { id: 'listing-1' },
    });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('supports an async resolver', async () => {
    const resolve = vi.fn().mockResolvedValue({ scholarSlug: 'scholar-a' });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'write',
      subjectType: 'Listing',
      resolve,
    });
    const ctx = mockContext({
      user: baseUser({
        accessGrants: [
          { target: 'listing', capability: 'write', scholarSlug: 'scholar-a', locale: null },
        ],
      }),
      params: { id: 'listing-1' },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('denies a global grant when a resolver cannot resolve the resource', async () => {
    const resolve = vi.fn().mockReturnValue({ scholarSlug: undefined });
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      action: 'write',
      subjectType: 'Listing',
      resolve,
    });
    const ctx = mockContext({
      user: baseUser({
        accessGrants: [{ target: 'listing', capability: 'write', scholarSlug: null, locale: null }],
      }),
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
