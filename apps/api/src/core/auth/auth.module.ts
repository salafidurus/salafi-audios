import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthLocaleController } from './auth-locale.controller';
import { AppleNativeController } from './apple-native.controller';
import { AppleNativeService } from './apple-native.service';
import { AppleNativeRepository } from './apple-native.repo';

/** Core API auth.module module providing shared backend infrastructure and authority-boundary services. */
@Module({
  controllers: [AuthLocaleController, AppleNativeController],
  providers: [AuthGuard, AppleNativeService, AppleNativeRepository],
  exports: [AuthGuard],
})
/** NestJS auth module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AuthModule {}
