import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Core API db.module module providing shared backend infrastructure and authority-boundary services. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
/** NestJS db module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class DbModule {}
