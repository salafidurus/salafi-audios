import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@sd/db/client';
import { ConfigService } from '@/shared/config/config.service';
import { PrismaPg } from '@prisma/adapter-pg';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private isConnected = false;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
    super({
      adapter,
      log: ['query', 'warn', 'error'],
    });
    this.logger.setContext(PrismaService.name);
  }

  async onModuleInit() {
    await this.$connect();
    this.isConnected = true;
    this.logger.info({ db: true }, 'Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.isConnected = false;
    this.logger.info({ db: true }, 'Prisma disconnected from database');
  }

  async ensureConnection() {
    if (this.isConnected) return;

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.warn({ db: true }, 'Prisma reconnected');
    } catch (err) {
      this.logger.error({ err, db: true }, 'Prisma reconnect failed');
      throw err;
    }
  }
}
