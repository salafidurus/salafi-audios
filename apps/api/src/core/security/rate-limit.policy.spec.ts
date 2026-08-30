import { describe, expect, it } from 'bun:test';

import {
  getRateLimitIdentity,
  getRateLimitPolicy,
  resolveRateLimitPolicy,
} from './rate-limit.policy';

describe('rate-limit policies', () => {
  it('provides explicit production budgets for each traffic class', () => {
    expect(getRateLimitPolicy('public-read', 'production')).toMatchObject({
      limit: 120,
      timeWindowMs: 60_000,
      appliesGlobalSafety: true,
    });
    expect(getRateLimitPolicy('expensive-search', 'production')).toMatchObject({
      limit: 20,
      timeWindowMs: 60_000,
    });
    expect(getRateLimitPolicy('health-probe', 'production')).toMatchObject({
      limit: 30,
      timeWindowMs: 10_000,
      appliesGlobalSafety: false,
      failureMode: 'open',
    });
  });

  it('uses deterministic low budgets in test mode', () => {
    expect(getRateLimitPolicy('admin-write', 'test')).toMatchObject({
      limit: 2,
      timeWindowMs: 1_000,
    });
  });

  it('prefers the authenticated principal over the network identity', () => {
    const request = { ip: '10.0.0.1', user: { id: 'user-1' } } as never;

    expect(getRateLimitIdentity(request)).toBe('user:user-1');
  });

  it('uses Fastify resolved IP identity for anonymous traffic', () => {
    const request = { ip: '10.0.0.1' } as never;

    expect(getRateLimitIdentity(request)).toBe('ip:10.0.0.1');
  });

  it('resolves explicit route metadata before the protected-route fallback', () => {
    expect(resolveRateLimitPolicy('expensive-search', false)).toBe('expensive-search');
    expect(resolveRateLimitPolicy(undefined, false)).toBe('authenticated');
    expect(resolveRateLimitPolicy(undefined, true)).toBe('public-read');
  });
});
