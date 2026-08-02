import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { CurrentUser } from '../../core/auth/decorators';
import { resolveScholarIdParam } from '../../core/auth/policy-resolvers';
import { defineAbilityFor } from '../../core/auth/ability/ability.factory';
import { accessibleScopeIds } from '../../core/auth/ability/accessible-scope';
import type { AbilityInput } from '../../core/auth/ability/ability.types';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller('admin/scholars')
export class AdminScholarsController {
  constructor(private readonly service: ScholarsService) {}

  @Get()
  @CheckPolicy('read', 'Scholar')
  @ApiOperation({ summary: 'List all scholars (including inactive)' })
  list(
    @Query('cursor') cursor: string | undefined,
    @Query('search') search: string | undefined,
    @CurrentUser() user: AbilityInput,
  ) {
    const ability = defineAbilityFor(user);
    const accessibleScholarIds = accessibleScopeIds(ability, 'read', 'Scholar', 'id');
    return this.service.adminList(cursor, search, accessibleScholarIds);
  }

  @Get(':id/form-data')
  @CheckPolicy('update', 'Scholar', resolveScholarIdParam())
  @ApiOperation({ summary: 'Get scholar with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  @Post()
  @CheckPolicy('create', 'Scholar')
  @ApiOperation({ summary: 'Create a scholar' })
  create(@Body() dto: CreateScholarDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @CheckPolicy('update', 'Scholar', resolveScholarIdParam())
  @ApiOperation({ summary: 'Update a scholar' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarDto) {
    return this.service.update(id, dto);
  }
}
