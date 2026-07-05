import { createZodDto } from 'nestjs-zod';
import { CreateLectureDtoSchema } from '@sd/core-contracts';

export class CreateLectureDto extends createZodDto(CreateLectureDtoSchema) {}
