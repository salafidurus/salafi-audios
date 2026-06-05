/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { ConfigService } from '../../shared/config/config.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

describe('LiveController', () => {
  let controller: LiveController;
  let service: jest.Mocked<LiveService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveController],
      providers: [
        {
          provide: LiveService,
          useValue: {
            updates$: of(),
            emitSessionUpdate: jest.fn(),
            getSessionPublic: jest.fn(),
            getChannels: jest.fn(),
            getChannelBySlug: jest.fn(),
            getActive: jest.fn(),
            getUpcoming: jest.fn(),
            getEnded: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            LIVESTREAM_SECRET: 'test-secret',
          },
        },
      ],
    }).compile();

    controller = module.get(LiveController);
    service = module.get(LiveService) as any;
  });

  describe('syncNotify', () => {
    it('should throw UnauthorizedException if authorization header is missing', async () => {
      await expect(
        controller.syncNotify(undefined as any, { sessionId: '123' }),
      ).rejects.toThrow(new UnauthorizedException('Missing token'));
    });

    it('should throw UnauthorizedException if token does not start with Bearer', async () => {
      await expect(
        controller.syncNotify('Basic token', { sessionId: '123' }),
      ).rejects.toThrow(new UnauthorizedException('Missing token'));
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      await expect(
        controller.syncNotify('Bearer wrong-token', { sessionId: '123' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid token'));
    });

    it('should throw NotFoundException if session does not exist', async () => {
      service.getSessionPublic.mockResolvedValue(null);

      await expect(
        controller.syncNotify('Bearer test-secret', { sessionId: '123' }),
      ).rejects.toThrow(new NotFoundException('Session "123" not found'));
    });

    it('should call emitSessionUpdate and return success if token is valid', async () => {
      const mockSession = { id: '123', status: 'live' } as any;
      service.getSessionPublic.mockResolvedValue(mockSession);

      const result = await controller.syncNotify('Bearer test-secret', {
        sessionId: '123',
      });

      expect(result).toEqual({ success: true });
      expect(service.getSessionPublic).toHaveBeenCalledWith('123');
      expect(service.emitSessionUpdate).toHaveBeenCalledWith(mockSession);
    });
  });
});
