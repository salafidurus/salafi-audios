import { Module } from "@nestjs/common";
import { InternalGuard } from "../shared/guards/internal.guard";
import { ChannelsController } from "./channels.controller";
import { ChannelsRepository } from "./channels.repo";
import { ChannelsService } from "./channels.service";

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsRepository, InternalGuard],
  exports: [ChannelsService],
})
export class ChannelsModule {}
