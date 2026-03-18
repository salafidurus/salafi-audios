// apps/api/src/modules/auth/auth.guard.spec.ts
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('./auth.instance', () => ({ auth: mockAuth }));

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
    jest.clearAllMocks();
  });

  it('allows @Public() routes without a session', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    await expect(guard.canActivate(mockContext())).resolves.toBe(true);
    expect(mockAuth.api.getSession).not.toHaveBeenCalled();
  });

  it('throws 401 when no session', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    mockAuth.api.getSession.mockResolvedValue(null);
    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('attaches user to request and returns true when session is valid', async () => {
    const fakeUser = { id: 'u1', role: 'user', email: 'a@b.com' };
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
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
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(['admin']); // roles
    mockAuth.api.getSession.mockResolvedValue({ user: fakeUser, session: {} });
    await expect(guard.canActivate(mockContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
