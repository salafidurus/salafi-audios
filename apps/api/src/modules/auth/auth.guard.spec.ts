import { vi } from 'vitest';
// apps/api/src/modules/auth/auth.guard.spec.ts
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

const mockAuth = { api: { getSession: vi.fn() } };
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

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
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

  it('attaches user to request and returns true when session is valid', async () => {
    const fakeUser = { id: 'u1', role: 'user', email: 'a@b.com' };
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    const req: Record<string, unknown> = { headers: {}, user: undefined };
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user).toEqual(fakeUser);
  });

  it('throws 401 when user role does not match @Roles()', async () => {
    const fakeUser = { id: 'u1', role: 'user' };
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['admin']); // roles
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    await expect(guard.canActivate(mockContext())).rejects.toThrow(UnauthorizedException);
  });

  describe('ban enforcement', () => {
    it('throws 403 for a permanently banned user (banned: true, banExpires: null)', async () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u2', role: 'user', banned: true, banExpires: null },
        session: {},
      });
      await expect(guard.canActivate(mockContext())).rejects.toThrow(ForbiddenException);
    });

    it('throws 403 for a temporarily banned user whose ban has not yet expired', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u3', role: 'user', banned: true, banExpires: tomorrow },
        session: {},
      });
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
        user: { id: 'u4', role: 'user', banned: true, banExpires: yesterday },
        session: {},
      });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });
});
