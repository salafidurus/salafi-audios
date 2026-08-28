import { createZodDto } from 'nestjs-zod';
import { SearchQueryDtoSchema } from '@sd/core-contracts';

/** search application module responsible for search query.dto behavior at the backend boundary. */
/** NestJS search query dto service or controller coordinating the API boundary for this responsibility. */
export class SearchQueryDto extends createZodDto(SearchQueryDtoSchema) {}
