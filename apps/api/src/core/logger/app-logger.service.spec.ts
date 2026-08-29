import { describe, expect, it, vi } from 'bun:test';
import { AppLoggerService } from './app-logger.service';

function createLogger() {
  const child = {
    child: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    fatal: vi.fn(),
  };
  child.child.mockReturnValue(child);

  return {
    child: vi.fn(() => child),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    silent: vi.fn(),
    level: 'info',
    childLogger: child,
  };
}

describe('AppLoggerService', () => {
  it('adds application context to structured log calls', () => {
    const logger = createLogger();
    const service = new AppLoggerService(logger);

    service.setContext('PrismaService');
    service.info({ db: true }, 'Prisma connected to database');

    expect(logger.child).toHaveBeenCalledWith({ context: 'PrismaService' });
    expect(logger.childLogger.info).toHaveBeenCalledWith(
      { db: true },
      'Prisma connected to database',
    );
  });

  it('forwards structured warnings and errors without discarding fields', () => {
    const logger = createLogger();
    const service = new AppLoggerService(logger);

    service.warn({ redis: true }, 'Redis is unavailable');
    service.error({ err: new Error('connection refused'), db: true }, 'Database reconnect failed');

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({ redis: true }, 'Redis is unavailable');
    expect(logger.error).toHaveBeenCalledWith(
      { err: expect.any(Error), db: true },
      'Database reconnect failed',
    );
  });

  it('adapts Nest log calls to the application logger', () => {
    const logger = createLogger();
    const service = new AppLoggerService(logger);

    service.log('Application started');
    service.error(new Error('startup failed'), 'stack', 'Bootstrap');
    service.warn('Application warning', 'Bootstrap');

    expect(logger.info).toHaveBeenCalledWith('Application started');
    expect(logger.error).toHaveBeenCalledWith(
      { err: expect.any(Error) },
      'startup failed',
      'stack',
      'Bootstrap',
    );
    expect(logger.warn).toHaveBeenCalledWith('Application warning', 'Bootstrap');
  });
});
