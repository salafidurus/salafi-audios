import { Injectable, NotFoundException } from "@nestjs/common";
import { ChannelsRepository } from "./channels.repo";

@Injectable()
export class ChannelsService {
  constructor(private readonly repo: ChannelsRepository) {}

  listAll() {
    return this.repo.findAll();
  }
  listActive() {
    return this.repo.findActive();
  }

  async getById(id: string) {
    const channel = await this.repo.findById(id);
    if (!channel) throw new NotFoundException(`Channel ${id} not found`);
    return channel;
  }

  create(data: {
    telegramId: string;
    telegramSlug?: string;
    displayName: string;
    scholarId?: string;
    language?: string;
  }) {
    return this.repo.create(data);
  }

  update(
    id: string,
    data: {
      telegramSlug?: string;
      displayName?: string;
      scholarId?: string;
      language?: string;
      isActive?: boolean;
    },
  ) {
    return this.repo.update(id, data);
  }
}
