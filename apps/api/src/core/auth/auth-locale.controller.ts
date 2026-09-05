import { Body, Controller, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateLocaleDtoSchema, type UpdateLocaleDto } from '@sd/core-contracts';
import { PrismaService } from '../db/prisma.service';
import { CurrentUser } from './decorators';

/** NestJS auth locale controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Auth')
@Controller({ path: 'auth/me', version: '1' })
/** Core API auth locale.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AuthLocaleController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('locale')
  @ApiOperation({ summary: 'Update the current user preferred language' })
  async updateLocale(
    @CurrentUser() user: { id: string },
    @Body({ schema: UpdateLocaleDtoSchema }) dto: UpdateLocaleDto,
    // oxlint-disable-next-line anti-slop/require-tsdoc -- Inline structural field is covered by the enclosing API method contract.
  ): Promise<{ preferredLanguage: string }> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { preferredLanguage: dto.preferredLanguage },
    });
    return { preferredLanguage: dto.preferredLanguage };
  }
}
