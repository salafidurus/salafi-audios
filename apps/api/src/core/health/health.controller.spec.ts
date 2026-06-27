import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { R2HealthIndicator } from './r2-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prismaHealth: { pingCheck: any };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let r2Health: { pingCheck: any };

  beforeEach(async () => {
    prismaHealth = {
      pingCheck: vi.fn().mockResolvedValue({ database: { status: 'up' } }),
    };
    r2Health = {
      pingCheck: vi.fn().mockResolvedValue({ storage: { status: 'up' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        { provide: PrismaHealthIndicator, useValue: prismaHealth },
        { provide: R2HealthIndicator, useValue: r2Health },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('getHealth calls database indicator but not storage indicator', async () => {
    await controller.getHealth();
    expect(prismaHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 300,
    });
    expect(r2Health.pingCheck).not.toHaveBeenCalled();
  });

  it('getReady calls database indicator but not storage indicator', async () => {
    await controller.getReady();
    expect(prismaHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 300,
    });
    expect(r2Health.pingCheck).not.toHaveBeenCalled();
  });

  it('getLive succeeds with no indicator calls', async () => {
    const result = await controller.getLive();
    expect(result.status).toBe('ok');
    expect(prismaHealth.pingCheck).not.toHaveBeenCalled();
    expect(r2Health.pingCheck).not.toHaveBeenCalled();
  });
});
