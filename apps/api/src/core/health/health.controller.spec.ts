import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { R2HealthIndicator } from './r2-health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaHealth: jest.Mocked<Pick<PrismaHealthIndicator, 'pingCheck'>>;
  let r2Health: jest.Mocked<Pick<R2HealthIndicator, 'pingCheck'>>;

  beforeEach(async () => {
    prismaHealth = {
      pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    };
    r2Health = {
      pingCheck: jest.fn().mockResolvedValue({ storage: { status: 'up' } }),
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

  it('getHealth calls both database and storage indicators', async () => {
    await controller.getHealth();
    expect(prismaHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 300,
    });
    expect(r2Health.pingCheck).toHaveBeenCalledWith('storage', {
      timeout: 300,
    });
  });

  it('getReady calls both database and storage indicators', async () => {
    await controller.getReady();
    expect(prismaHealth.pingCheck).toHaveBeenCalledWith('database', {
      timeout: 300,
    });
    expect(r2Health.pingCheck).toHaveBeenCalledWith('storage', {
      timeout: 300,
    });
  });

  it('getLive succeeds with no indicator calls', async () => {
    const result = await controller.getLive();
    expect(result.status).toBe('ok');
    expect(prismaHealth.pingCheck).not.toHaveBeenCalled();
    expect(r2Health.pingCheck).not.toHaveBeenCalled();
  });
});
