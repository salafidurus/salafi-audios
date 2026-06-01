import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import type { Request } from "express";
import { ChannelsService } from "./channels.service";

@Injectable()
class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.INTERNAL_SECRET;
    if (!secret) return false;
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers["x-internal-secret"] === secret;
  }
}

@UseGuards(InternalGuard)
@Controller("channels")
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}

  @Get()
  list() {
    return this.service.listAll();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.getById(id);
  }

  @Post()
  create(
    @Body()
    body: {
      telegramId: string;
      telegramSlug?: string;
      displayName: string;
      scholarId?: string;
      language?: string;
    },
  ) {
    return this.service.create(body);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body()
    body: {
      telegramSlug?: string;
      displayName?: string;
      scholarId?: string;
      language?: string;
      isActive?: boolean;
    },
  ) {
    return this.service.update(id, body);
  }
}
