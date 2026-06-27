import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';
import { R2HealthIndicator } from './r2-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, R2HealthIndicator],
})
export class HealthModule {}
