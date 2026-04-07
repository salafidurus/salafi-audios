import { Controller, Get, Post, Patch, Param, Body } from "@nestjs/common";
import { ChannelsService } from "./channels.service";

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
