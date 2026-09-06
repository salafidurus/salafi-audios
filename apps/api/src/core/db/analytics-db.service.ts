import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AnalyticsPrismaClient } from '@sd/core-db';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '../config/config.service';
import { AppLoggerService } from '../logger/app-logger.service';

/** NestJS analytics database service coordinating the API boundary for this responsibility. */
@Injectable()
/** core API application module responsible for analytics-db.service behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AnalyticsDbService
  extends AnalyticsPrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private isConnected = false;

  constructor(
    config: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    super({ adapter: new PrismaPg({ connectionString: config.ANALYTICS_DATABASE_URL }) });
    this.logger.setContext(AnalyticsDbService.name);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.isConnected = true;
    this.logger.info({ db: 'analytics' }, 'Analytics database connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.isConnected = false;
    this.logger.info({ db: 'analytics' }, 'Analytics database disconnected');
  }

  /** Reconnects after a transient analytics database outage. */
  async ensureConnection(): Promise<void> {
    if (this.isConnected) return;
    await this.$connect();
    this.isConnected = true;
  }
}
