import { createZodDto } from 'nestjs-zod';
import { SearchQueryDtoSchema } from '@sd/core-contracts';

export class SearchQueryDto extends createZodDto(SearchQueryDtoSchema) {}
