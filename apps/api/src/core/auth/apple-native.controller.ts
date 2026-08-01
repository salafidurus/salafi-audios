import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppleNativeService } from './apple-native.service';
import { AppleNativeSignInDto } from './dto/apple-native-sign-in.dto';
import { Public } from './decorators';

@ApiExcludeController()
@Controller('auth/apple')
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
