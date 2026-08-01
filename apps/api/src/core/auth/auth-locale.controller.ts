import { Body, Controller, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../db/prisma.service';
import { CurrentUser } from './decorators';
import { UpdateLocaleDto } from './dto/update-locale.dto';

@ApiTags('Auth')
@Controller('auth/me')
export class AuthLocaleController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('locale')
  @ApiOperation({ summary: 'Update the current user preferred language' })
  async updateLocale(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateLocaleDto,
  ): Promise<{ preferredLanguage: string }> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { preferredLanguage: dto.preferredLanguage },
    });
    return { preferredLanguage: dto.preferredLanguage };
  }
}
