import { Injectable } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@sd/core-db';
import { ConfigService } from '../config/config.service';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppLoggerService } from '../logger/app-logger.service';
import { getPrismaLogLevels } from './prisma-log-levels';

/** NestJS primary database service coordinating the API's transactional database boundary. */
@Injectable()
/** Core API primary-db.service module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class PrimaryDbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor(
    config: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    const connectionString = requireDatabaseConnection(config);
    const adapter = new PrismaPg({ connectionString });
    super({
      adapter,
      log: getPrismaLogLevels(getPrismaLogQueries(config)),
    });
    this.logger?.setContext(PrimaryDbService.name);
  }

  async onModuleInit() {
    await this.$connect();
    this.isConnected = true;
    this.logger?.info({ db: 'primary' }, 'Primary database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.isConnected = false;
    this.logger?.info({ db: 'primary' }, 'Primary database disconnected');
  }

  async ensureConnection() {
    if (this.isConnected) return;

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger?.warn({ db: 'primary' }, 'Primary database reconnected');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger?.error({ err: error, db: 'primary' }, 'Primary database reconnect failed');
      throw err;
    }
  }
}

function requireDatabaseConnection(config: ConfigService): string {
  const connectionString =
    config?.PRIMARY_DATABASE_URL ??
    process.env['PRIMARY_DATABASE_URL'] ??
    process.env['PRIMARY_DIRECT_DATABASE_URL'];
  if (!connectionString) {
    throw new Error('PRIMARY_DATABASE_URL is required and no DB fallback is allowed.');
  }
  return connectionString;
}

function getPrismaLogQueries(config: ConfigService): boolean {
  return config?.PRISMA_LOG_QUERIES ?? process.env['PRISMA_LOG_QUERIES'] === 'true';
}
