import { createZodDto } from 'nestjs-zod';
import { UpdateScholarTranslationDtoSchema } from '@sd/core-contracts';

export class UpdateScholarTranslationDto extends createZodDto(UpdateScholarTranslationDtoSchema) {}
