import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/db/prisma.service";

@Injectable()
export class ChannelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.livestreamChannel.findMany({
      orderBy: { displayName: "asc" },
      include: { scholar: { select: { id: true, slug: true, name: true } } },
    });
  }

  async findActive() {
    return this.prisma.livestreamChannel.findMany({
      where: { isActive: true },
      select: { id: true, telegramId: true, telegramSlug: true, displayName: true },
    });
  }

  async findById(id: string) {
    return this.prisma.livestreamChannel.findUnique({
      where: { id },
      include: { scholar: { select: { id: true, slug: true, name: true } } },
    });
  }

  async create(data: {
    telegramId: string;
    telegramSlug?: string;
    displayName: string;
    scholarId?: string;
    language?: string;
  }) {
    return this.prisma.livestreamChannel.create({ data });
  }

  async update(
    id: string,
    data: {
      telegramSlug?: string;
      displayName?: string;
      scholarId?: string;
      language?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.livestreamChannel.update({ where: { id }, data });
  }
}
