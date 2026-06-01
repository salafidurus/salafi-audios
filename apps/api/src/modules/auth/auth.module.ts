import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthLocaleController } from './auth-locale.controller';

@Module({
  controllers: [AuthLocaleController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
