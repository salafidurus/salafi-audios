import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { resolveScholarIdParam } from '../../core/auth/policy-resolvers';
import { ScholarsService } from './scholars.service';
import {
  CreateScholarDtoSchema,
  UpdateScholarDtoSchema,
  type CreateScholarDto,
  type UpdateScholarDto,
} from '@sd/core-contracts';
import { RateLimitPolicy } from '../../core/security/rate-limit.decorator';

/** NestJS admin scholars controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller({ path: 'admin/scholars', version: '1' })
/** scholars application module responsible for admin scholars.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AdminScholarsController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @ApiOperation({ summary: 'List all scholars (including inactive)' })
  list(@Query('cursor') cursor: string | undefined, @Query('search') search: string | undefined) {
    return this.service.adminList(cursor, search, undefined);
  }

  @Get(':id/form-data')
  @CheckPolicy('write', 'Scholar', resolveScholarIdParam())
  @ApiOperation({ summary: 'Get scholar with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  @Post()
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Scholar')
  @ApiOperation({ summary: 'Create a scholar' })
  create(@Body({ schema: CreateScholarDtoSchema }) dto: CreateScholarDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Scholar', resolveScholarIdParam())
  @ApiOperation({ summary: 'Update a scholar' })
  update(@Param('id') id: string, @Body({ schema: UpdateScholarDtoSchema }) dto: UpdateScholarDto) {
    return this.service.update(id, dto);
  }
}
