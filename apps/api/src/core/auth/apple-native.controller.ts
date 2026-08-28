import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppleNativeService } from './apple-native.service';
import { AppleNativeSignInDto } from './dto/apple-native-sign-in.dto';
import { Public } from './decorators';

/** NestJS apple native controller service or controller coordinating the API boundary for this responsibility. */
@ApiExcludeController()
@Controller('auth/apple')
/** Core API apple native.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AppleNativeController {
  constructor(private readonly appleNativeService: AppleNativeService) {}

  @Public()
  @Post('native')
  @HttpCode(200)
  async nativeSignIn(@Body() dto: AppleNativeSignInDto) {
    const { identityToken, user: appleUser } = dto;

    const payload = await this.appleNativeService.verifyIdentityToken(identityToken);

    return this.appleNativeService.handleAppleSignIn(payload, appleUser);
  }
}
