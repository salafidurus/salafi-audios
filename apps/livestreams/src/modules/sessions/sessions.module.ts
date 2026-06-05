import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { SessionsRepository } from "./sessions.repo";

@Module({
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
