import { createZodDto } from 'nestjs-zod';
import { SaveListingTranslationDtoSchema } from '@sd/core-contracts';

/** listing application module responsible for save listing translation.dto behavior at the backend boundary. */
/** NestJS save listing translation dto service or controller coordinating the API boundary for this responsibility. */
export class SaveListingTranslationDto extends createZodDto(SaveListingTranslationDtoSchema) {}
