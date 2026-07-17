import { vi, describe, it, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { AppleNativeController } from './apple-native.controller';
import { AppleNativeService } from './apple-native.service';

describe('AppleNativeController', () => {
  let controller: AppleNativeController;
  let service: {
    verifyIdentityToken: ReturnType<typeof vi.fn>;
    handleAppleSignIn: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      verifyIdentityToken: vi.fn<any>(),
      handleAppleSignIn: vi.fn<any>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppleNativeController],
      providers: [{ provide: AppleNativeService, useValue: service }],
    }).compile();

    controller = module.get<AppleNativeController>(AppleNativeController);
  });

  it('returns session on valid identity token', async () => {
    const payload = { sub: '000123.abc', email: 'user@icloud.com' };
    const sessionResult = {
      session: { id: 'sess_1', expiresAt: new Date() },
      user: { id: 'user_1' },
    };

    service.verifyIdentityToken.mockResolvedValue(payload);
    service.handleAppleSignIn.mockResolvedValue(sessionResult);

    const result = await controller.nativeSignIn({
      identityToken: 'valid.jwt.token',
      user: { firstName: 'John', lastName: 'Doe' },
    });

    expect(result).toEqual(sessionResult);
    expect(service.verifyIdentityToken).toHaveBeenCalledWith('valid.jwt.token');
    expect(service.handleAppleSignIn).toHaveBeenCalledWith(payload, {
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('throws when identity token verification fails', async () => {
    service.verifyIdentityToken.mockRejectedValue(new Error('verification failed'));

    await expect(
      controller.nativeSignIn({
        identityToken: 'invalid.token',
        user: {},
      }),
    ).rejects.toThrow('verification failed');

    expect(service.handleAppleSignIn).not.toHaveBeenCalled();
  });
});
