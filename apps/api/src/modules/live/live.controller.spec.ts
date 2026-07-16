import { vi, type Mocked } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { of } from 'rxjs';

describe('LiveController', () => {
  let controller: LiveController;
  let service: Mocked<LiveService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveController],
      providers: [
        {
          provide: LiveService,
          useValue: {
            updates$: of(),
            emitSessionUpdate: vi.fn<any>(),
            getSessionPublic: vi.fn<any>(),
            getChannels: vi.fn<any>(),
            getChannelBySlug: vi.fn<any>(),
            getActive: vi.fn<any>(),
            getUpcoming: vi.fn<any>(),
            getEnded: vi.fn<any>(),
          },
        },
      ],
    }).compile();

    controller = module.get(LiveController);
    service = module.get(LiveService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getChannels delegates to service', async () => {
    service.getChannels.mockResolvedValue([]);
    await controller.getChannels();
    expect(service.getChannels).toHaveBeenCalled();
  });
});
