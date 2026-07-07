import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthLocaleController } from './auth-locale.controller';
import { AuthBridgeController } from './auth-bridge.controller';
import { AppleNativeController } from './apple-native.controller';
import { AppleNativeService } from './apple-native.service';
import { AppleNativeRepository } from './apple-native.repo';

@Module({
  controllers: [AuthLocaleController, AuthBridgeController, AppleNativeController],
  providers: [AuthGuard, AppleNativeService, AppleNativeRepository],
  exports: [AuthGuard],
})
export class AuthModule {}
