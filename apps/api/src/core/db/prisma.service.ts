import { Injectable } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@sd/core-db';
import { ConfigService } from '../config/config.service';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppLoggerService } from '../logger/app-logger.service';
import { getPrismaLogLevels } from './prisma-log-levels';

/** NestJS prisma service service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** Core API prisma.service module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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
    this.logger?.setContext(PrismaService.name);
  }

  async onModuleInit() {
    await this.$connect();
    this.isConnected = true;
    this.logger?.info({ db: true }, 'Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.isConnected = false;
    this.logger?.info({ db: true }, 'Prisma disconnected from database');
  }

  async ensureConnection() {
    if (this.isConnected) return;

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger?.warn({ db: true }, 'Prisma reconnected');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger?.error({ err: error, db: true }, 'Prisma reconnect failed');
      throw err;
    }
  }
}

function requireDatabaseConnection(config: ConfigService): string {
  const connectionString =
    config?.DATABASE_URL ?? process.env['DATABASE_URL'] ?? process.env['DIRECT_DB_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is required and no DB fallback is allowed.');
  }
  return connectionString;
}

function getPrismaLogQueries(config: ConfigService): boolean {
  return config?.PRISMA_LOG_QUERIES ?? process.env['PRISMA_LOG_QUERIES'] === 'true';
}
