import { createZodDto } from 'nestjs-zod';
import { UpdateProfileDtoSchema } from '@sd/core-contracts';

export class UpdateProfileDto extends createZodDto(UpdateProfileDtoSchema) {}
