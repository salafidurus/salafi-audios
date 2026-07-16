import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { PrismaHealthIndicator } from './prisma-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prismaHealth: { pingCheck: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cdnHealth: { pingCheck: any };

  beforeEach(async () => {
    prismaHealth = {
      pingCheck: vi.fn<any>().mockResolvedValue({ database: { status: 'up' } }),
    };
    cdnHealth = {
      pingCheck: vi.fn<any>().mockResolvedValue({ cdn: { status: 'up' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: PrismaHealthIndicator, useValue: prismaHealth },
        { provide: CDNHealthIndicator, useValue: cdnHealth },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('getHealth calls database and CDN indicators', async () => {
    await controller.getHealth();
    expect(prismaHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 300,
    });
    expect(cdnHealth.pingCheck).toHaveBeenCalledWith('cdn', {
      timeout: 5000,
    });
  });

  it('getReadiness calls database indicator but not CDN indicator', async () => {
    await controller.getReadiness();
    expect(prismaHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 300,
    });
    expect(cdnHealth.pingCheck).not.toHaveBeenCalled();
  });

  it('getLiveness succeeds with no indicator calls', async () => {
    const result = await controller.getLiveness();
    expect(result.status).toBe('ok');
    expect(prismaHealth.pingCheck).not.toHaveBeenCalled();
    expect(cdnHealth.pingCheck).not.toHaveBeenCalled();
  });
});
