import { createZodDto } from 'nestjs-zod';
import { SaveLectureTranslationDtoSchema } from '@sd/core-contracts';

export class SaveLectureTranslationDto extends createZodDto(SaveLectureTranslationDtoSchema) {}
