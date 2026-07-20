import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { CurrentUser } from '../../modules/auth/decorators';
import type { QuickBrowseDto } from '@sd/core-contracts';
import { HomeService } from './home.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

@SkipThrottle()
@ApiTags('Home')
@ApiCommonErrors()
@Public()
@Controller('home')
@UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
@CacheTTL(5 * 60 * 1000) // 5 minutes cache
export class HomeController {
  constructor(private readonly home: HomeService) {}

  @Get('quickbrowse')
  @ApiOperation({ summary: 'Get QuickBrowse data' })
  @ApiOkResponse({ description: 'QuickBrowse data for home screen' })
  getQuickBrowse(
    @Query('topicSlugs') topicSlugs?: string,
    @Query('scholarSlugs') scholarSlugs?: string,
    @CurrentUser() user?: { id: string },
  ): Promise<QuickBrowseDto> {
    const topics = topicSlugs ? topicSlugs.split(',').map((s) => s.trim()) : undefined;
    const scholars = scholarSlugs ? scholarSlugs.split(',').map((s) => s.trim()) : undefined;

    return this.home.getQuickBrowse(topics, scholars, user?.id);
  }
}
