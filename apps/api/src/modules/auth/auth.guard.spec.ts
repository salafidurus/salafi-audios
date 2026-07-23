import { vi, describe, it, expect, beforeEach } from 'bun:test';
// apps/api/src/modules/auth/auth.guard.spec.ts
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('./auth.instance', () => ({ getAuth: () => mockAuth }));

function mockContext(headers: Record<string, string> = {}): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ headers, user: undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let mockPrisma: Partial<PrismaService>;

  beforeEach(() => {
    reflector = new Reflector();
    mockPrisma = {
      userRoleAssignment: {
        findMany: vi.fn<any>(),
      },
    } as unknown as Partial<PrismaService>;
    guard = new AuthGuard(reflector, mockPrisma as PrismaService);
    vi.clearAllMocks();
  });

  it('allows @Public() routes without a session', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    await expect(guard.canActivate(mockContext())).resolves.toBe(true);
    expect(mockAuth.api.getSession).not.toHaveBeenCalled();
  });

  it('throws 401 when no session', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    mockAuth.api.getSession.mockResolvedValue(null);
    await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
  });

  it('attaches user to request with roles when session is valid', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com' };
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([{ role: 'listener' }]);
    const req: Record<string, unknown> = { headers: {}, user: undefined };
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user).toEqual({ ...fakeUser, roles: ['listener'], permissions: [] });
  });

  it('assigns default listener role when user has no roles in DB or session', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com' };
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([]);
    const req: Record<string, unknown> = { headers: {}, user: undefined };
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user).toEqual({ ...fakeUser, roles: ['listener'], permissions: [] });
  });

  it('throws 401 when user role does not match @Roles()', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com' };
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['admin']); // required roles
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([{ role: 'listener' }]);
    await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
  });

  it('allows user with matching role from @Roles()', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.com' };
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['admin', 'editor']); // required roles
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([{ role: 'editor' }]);
    const req: Record<string, unknown> = { headers: {}, user: undefined };
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  describe('ban enforcement', () => {
    it('throws 403 for a permanently banned user (banned: true, banExpires: null)', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u2', email: 'banned@b.com', banned: true, banExpires: null },
        session: {},
      });
      (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([{ role: 'listener' }]);
      await expect(guard.canActivate(mockContext())).rejects.toThrow(ForbiddenException);
    });

    it('throws 403 for a temporarily banned user whose ban has not yet expired', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u3', email: 'tempban@b.com', banned: true, banExpires: tomorrow },
        session: {},
      });
      (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([{ role: 'listener' }]);
      await expect(guard.canActivate(mockContext())).rejects.toThrow(ForbiddenException);
    });

    it('passes through when a temporary ban has already expired', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const req: Record<string, unknown> = { headers: {}, user: undefined };
      const ctx = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => req }),
      } as unknown as ExecutionContext;
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u4', email: 'expiredban@b.com', banned: true, banExpires: yesterday },
        session: {},
      });
      (mockPrisma.userRoleAssignment!.findMany as any).mockResolvedValue([{ role: 'listener' }]);
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });
});
