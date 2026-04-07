import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeRepo } from './home.repo';

@Module({
  controllers: [HomeController],
  providers: [HomeService, HomeRepo],
})
export class HomeModule {}
